import { useActiveWeb3React } from 'hooks'
import { switchXDAIparams } from '.'
import { useSelectedListUrl } from 'state/lists/hooks'
import { selectList } from 'state/lists/actions'
import { useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { AppState, AppDispatch } from 'state'

export function XDAIoverrideUpdater(): null {
  const { chainId } = useActiveWeb3React()

  // sync update to not rely on useEffect timing
  switchXDAIparams(chainId)

  return null
}

export function TokenListUpdater(): null {
  const { chainId } = useActiveWeb3React()

  const dispatch = useDispatch<AppDispatch>()

  const listsByUrl = useSelector<AppState, AppState['lists']['byUrl']>(state => state.lists.byUrl)
  const listsByUrlRef = useRef(listsByUrl)
  listsByUrlRef.current = listsByUrl

  const currentListUrl = useSelectedListUrl()

  const currentList = currentListUrl ? listsByUrl[currentListUrl] : undefined

  // ref, so we don'tdepend on currentList in useEffect
  const currentListRef = useRef(currentList?.current)
  currentListRef.current = currentList?.current

  useEffect(() => {
    if (!chainId || !currentListRef.current) return

    // chainId changed
    // currentList may not have tokens for the new chainId
    const listHasTokens = currentListRef.current.tokens.some(token => token.chainId === chainId)

    // current list has valid tokens -- good
    if (listHasTokens) return

    // no tokens for chainId in the current list
    // try to switch to the first list that has valid tokens

    const listUrlWithValidTokens = Object.keys(listsByUrlRef.current).find(url => {
      const list = listsByUrlRef.current[url]
      // look for lists without errors
      if (list.error) return false
      // that have tokens for the current chainId
      return list.current?.tokens.some(token => token.chainId === chainId)
    })

    if (listUrlWithValidTokens) {
      // just switch to a new list
      // e.g. when MAINNET -> XDAI
      // will do Uniswap list -> Honeyswap list
      dispatch(selectList(listUrlWithValidTokens))

      // can make a popup to inform the user
      // extend ListUpdatePopup?

      // can aternatively ask the user what to do in a Modal
    }
  }, [chainId, dispatch])

  return null
}
