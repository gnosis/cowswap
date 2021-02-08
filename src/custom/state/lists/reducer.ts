import { createReducer } from '@reduxjs/toolkit'
import { ChainId } from '@uniswap/sdk'
import { getVersionUpgrade, VersionUpgrade } from '@uniswap/token-lists'
import { TokenList } from '@uniswap/token-lists/dist/types'
import { getDefaultListByChainId, DEFAULT_LIST_OF_LISTS } from 'constants/lists'
import { acceptListUpdate, addList, fetchTokenList, removeList, selectList } from 'state/lists/actions'
import { updateVersion } from '@src/state/global/actions'
import { Mutable } from '@src/state/lists/reducer'

export type ListsState = {
  [chain: number]: {
    readonly byUrl: {
      readonly [url: string]: {
        readonly current: TokenList | null
        readonly pendingUpdate: TokenList | null
        readonly loadingRequestId: string | null
        readonly error: string | null
      }
    }
    // this contains the default list of lists from the last time the updateVersion was called, i.e. the app was reloaded
    readonly lastInitializedDefaultListOfLists: string[] | undefined
    readonly selectedListUrl: string | undefined
  }
}
type ChainIdKey = number
type ListState = ListsState[ChainIdKey]['byUrl'][string]

const NEW_LIST_STATE: ListState = {
  error: null,
  current: null,
  loadingRequestId: null,
  pendingUpdate: null
}

const defaultChainId = ChainId.MAINNET
const defaultTokenListNoChainId = getDefaultListByChainId(defaultChainId)
const defaultTokenList = DEFAULT_LIST_OF_LISTS[defaultChainId]
const initialState: ListsState = {
  [defaultChainId]: {
    lastInitializedDefaultListOfLists: defaultTokenList,
    byUrl: {
      ...defaultTokenList.reduce<Mutable<ListsState[typeof defaultChainId]['byUrl']>>((memo, listUrl) => {
        memo[listUrl] = NEW_LIST_STATE
        return memo
      }, {})
    },
    selectedListUrl: defaultTokenListNoChainId
  }
}

export default createReducer(initialState, builder =>
  builder
    .addCase(fetchTokenList.pending, (state, { payload: { requestId, url, chainId } }) => {
      state[chainId].byUrl[url] = {
        current: null,
        pendingUpdate: null,
        ...state[chainId].byUrl[url],
        loadingRequestId: requestId,
        error: null
      }
    })
    .addCase(fetchTokenList.fulfilled, (state, { payload: { requestId, tokenList, url, chainId } }) => {
      const current = state[chainId].byUrl[url]?.current
      const loadingRequestId = state[chainId].byUrl[url]?.loadingRequestId

      // no-op if update does nothing
      if (current) {
        const upgradeType = getVersionUpgrade(current.version, tokenList.version)
        if (upgradeType === VersionUpgrade.NONE) return
        if (loadingRequestId === null || loadingRequestId === requestId) {
          state[chainId].byUrl[url] = {
            ...state[chainId].byUrl[url],
            loadingRequestId: null,
            error: null,
            current: current,
            pendingUpdate: tokenList
          }
        }
      } else {
        state[chainId].byUrl[url] = {
          ...state[chainId].byUrl[url],
          loadingRequestId: null,
          error: null,
          current: tokenList,
          pendingUpdate: null
        }
      }
    })
    .addCase(fetchTokenList.rejected, (state, { payload: { url, requestId, errorMessage, chainId } }) => {
      if (state[chainId].byUrl[url]?.loadingRequestId !== requestId) {
        // no-op since it's not the latest request
        return
      }

      state[chainId].byUrl[url] = {
        ...state[chainId].byUrl[url],
        loadingRequestId: null,
        error: errorMessage,
        current: null,
        pendingUpdate: null
      }
    })
    .addCase(selectList, (state, { payload: { url, chainId } }) => {
      state[chainId].selectedListUrl = url
      // automatically adds list
      if (!state[chainId].byUrl[url]) {
        state[chainId].byUrl[url] = NEW_LIST_STATE
      }
    })
    .addCase(addList, (state, { payload: { url, chainId } }) => {
      if (!state[chainId].byUrl[url]) {
        state[chainId].byUrl[url] = NEW_LIST_STATE
      }
    })
    .addCase(removeList, (state, { payload: { url, chainId } }) => {
      if (state[chainId].byUrl[url]) {
        delete state[chainId].byUrl[url]
      }
      if (state[chainId].selectedListUrl === url) {
        const defaultList = getDefaultListByChainId(chainId)
        state[chainId].selectedListUrl = url === defaultList ? Object.keys(state[chainId].byUrl)[0] : defaultList
      }
    })
    .addCase(acceptListUpdate, (state, { payload: { url, chainId } }) => {
      if (!state[chainId].byUrl[url]?.pendingUpdate) {
        throw new Error('accept list update called without pending update')
      }
      state[chainId].byUrl[url] = {
        ...state[chainId].byUrl[url],
        pendingUpdate: null,
        current: state[chainId].byUrl[url].pendingUpdate
      }
    })
    .addCase(updateVersion, state => {
      const { lastInitializedDefaultListOfLists } = state[defaultChainId]
      // state loaded from localStorage, but new lists have never been initialized
      if (!lastInitializedDefaultListOfLists) {
        state[defaultChainId].byUrl = initialState[defaultChainId].byUrl
      } else if (lastInitializedDefaultListOfLists) {
        const lastInitializedSet = lastInitializedDefaultListOfLists.reduce<Set<string>>((s, l) => s.add(l), new Set())
        const newListOfListsSet = defaultTokenList.reduce<Set<string>>((s, l) => s.add(l), new Set())

        defaultTokenList.forEach(listUrl => {
          if (!lastInitializedSet.has(listUrl)) {
            state[defaultChainId].byUrl[listUrl] = NEW_LIST_STATE
          }
        })

        lastInitializedDefaultListOfLists.forEach(listUrl => {
          if (!newListOfListsSet.has(listUrl)) {
            delete state[defaultChainId].byUrl[listUrl]
          }
        })
      }

      state[defaultChainId].lastInitializedDefaultListOfLists = defaultTokenList

      if (!state[defaultChainId].selectedListUrl) {
        if (!state[defaultChainId].byUrl[defaultTokenListNoChainId]) {
          state[defaultChainId].byUrl[defaultTokenListNoChainId] = NEW_LIST_STATE
        }
      }
    })
)
