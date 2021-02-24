import { useEffect } from 'react'
import { unstable_batchedUpdates as batchedUpdates } from 'react-dom'
import { useDispatch } from 'react-redux'

import { useActiveWeb3React } from '@src/hooks'

import { DEFAULT_ACTIVE_LIST_URLS_BY_NETWORK, DEFAULT_LIST_OF_LISTS_BY_NETWORK } from 'constants/lists'
import { initialiseTokenLists } from './actions'
import { ListsState, NEW_LIST_STATE } from './reducer'
import { buildKey, buildListState } from './helpers'

export default function NetworkListUpdater(): null {
  const { chainId } = useActiveWeb3React()
  // const chainIdRef = useRef(chainId)

  const dispatch = useDispatch()

  // Loading//Saving network specific lists from//into storage
  useEffect(() => {
    if (chainId) {
      let refreshedTokenState: ListsState
      // build identifier for storage token list e.g Rinkeby list identifier = "_4"
      const newChainKey = buildKey(chainId)
      // Get the localStorage token list saved under identifer key
      // e.g "redux_localstorage_simple_lists_4"
      const storageListJSON = localStorage.getItem(newChainKey)

      // storageListJSON && localStorage.setItem(newChainKey, storageListJSON)
      if (storageListJSON) {
        // We have a storage token list
        // but what if it differs from the defaults?
        const oldStorageList = JSON.parse(storageListJSON)

        // cache the network specific defaults from 'custom/constants/lists'
        // access using chainId
        const newListOfLists = DEFAULT_LIST_OF_LISTS_BY_NETWORK[chainId]
        const newActiveListUrls = DEFAULT_ACTIVE_LIST_URLS_BY_NETWORK[chainId]

        // Make a copy of the previous storage list
        const tokenStateCopy = Object.assign({}, oldStorageList)

        // we need to compare the lists and merge/cleanup
        // lets start with the last initialised list of lists
        if (oldStorageList.lastInitializedDefaultListOfLists) {
          // Lets create a Set of the last initialised list of lists saved, to compare
          const oldStorageLastInitializedSet: Set<string> = new Set(tokenStateCopy.lastInitializedDefaultListOfLists)
          // and a set of the (potentially) new ones from 'custom/constants/lists'
          const newListofListsSet = new Set(newListOfLists)

          // lets loop over the 'constants/lists' listsOfLists and check the
          // oldStorageLastInitializedSet vs the storage list one
          newListofListsSet.forEach(newListUrl => {
            // if storage token list doesn't have a token list URL
            // that the new default does, we add it
            if (!oldStorageLastInitializedSet.has(newListUrl)) {
              tokenStateCopy.byUrl[newListUrl] = NEW_LIST_STATE
            }
          })

          // check the previous lists "lastInitialisedTokens" against the incoming list
          oldStorageLastInitializedSet.forEach((oldListUrl: string) => {
            // remove any token list urls that the default list doesn't have
            if (!newListofListsSet.has(oldListUrl)) {
              delete tokenStateCopy.byUrl[oldListUrl]
            }
          })

          // if no active lists, activate defaults
          if (!tokenStateCopy.activeListUrls) {
            tokenStateCopy.activeListUrls = newActiveListUrls

            // for each list on default list, initialize if needed
            newActiveListUrls.map((listUrl: string) => {
              if (!tokenStateCopy.byUrl[listUrl]) {
                tokenStateCopy.byUrl[listUrl] = NEW_LIST_STATE
              }
              return true
            })
          }
        }

        // set our state's last initialised to the new list
        tokenStateCopy.lastInitializedDefaultListOfLists = newListOfLists

        refreshedTokenState = tokenStateCopy
      } else {
        // clean slate, build defaults
        refreshedTokenState = buildListState({
          defaultActiveListUrls: DEFAULT_ACTIVE_LIST_URLS_BY_NETWORK[chainId],
          defaultListofLists: DEFAULT_LIST_OF_LISTS_BY_NETWORK[chainId],
          newListState: NEW_LIST_STATE
        })
      }

      batchedUpdates(() => {
        // save chain aware tokens to localStorage and redux
        dispatch(initialiseTokenLists(refreshedTokenState))
        localStorage.setItem(newChainKey, JSON.stringify(refreshedTokenState))
      })
    }
  }, [chainId, dispatch])

  return null
}
