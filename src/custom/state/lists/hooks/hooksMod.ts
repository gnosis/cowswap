import { useMemo } from 'react'
import { useSelector } from 'react-redux'
import { AppState } from '../..'
import { ChainId } from '@uniswap/sdk'
import { useActiveWeb3React } from 'hooks'
import { DEFAULT_NETWORK_FOR_LISTS, UNSUPPORTED_LIST_URLS } from 'constants/lists'
import { TokenList } from '@uniswap/token-lists'
import DEFAULT_TOKEN_LIST from '@uniswap/default-token-list'
import { TokenAddressMap, listToTokenMap, combineMaps, EMPTY_LIST } from '@src/state/lists/hooks'
import sortByListPriority from 'utils/listSort'
import UNSUPPORTED_TOKEN_LIST from 'constants/tokenLists/uniswap-v2-unsupported.tokenlist.json'

export * from '@src/state/lists/hooks'

// MOD
// This mod file adds { chainId } support to the hooks

export function useAllLists(): {
  readonly [url: string]: {
    readonly current: TokenList | null
    readonly pendingUpdate: TokenList | null
    readonly loadingRequestId: string | null
    readonly error: string | null
  }
} {
  // MOD: adds { chainId } support to the hooks
  const { chainId = DEFAULT_NETWORK_FOR_LISTS } = useActiveWeb3React()
  // return useSelector<AppState, AppState['lists']['byUrl']>(state => state.lists.byUrl)
  return useSelector<AppState, AppState['lists'][ChainId]['byUrl']>(state => state.lists[chainId].byUrl)
}

// merge tokens contained within lists from urls
export function useCombinedTokenMapFromUrls(urls: string[] | undefined): TokenAddressMap {
  // MOD: recreated here to allow it to use the custom useAllLists hook
  const lists = useAllLists()

  return useMemo(() => {
    if (!urls) return EMPTY_LIST

    return (
      urls
        .slice()
        // sort by priority so top priority goes last
        .sort(sortByListPriority)
        .reduce((allTokens, currentUrl) => {
          const current = lists[currentUrl]?.current
          if (!current) return allTokens
          try {
            const newTokens = Object.assign(listToTokenMap(current))
            return combineMaps(allTokens, newTokens)
          } catch (error) {
            console.error('Could not show token list due to error', error)
            return allTokens
          }
        }, EMPTY_LIST)
    )
  }, [lists, urls])
}

// filter out unsupported lists
export function useActiveListUrls(): string[] | undefined {
  // MOD: adds { chainId } support to the hooks
  const { chainId = DEFAULT_NETWORK_FOR_LISTS } = useActiveWeb3React()
  return useSelector<AppState, AppState['lists'][ChainId]['activeListUrls']>(
    state => state.lists[chainId].activeListUrls
  )?.filter(url => !UNSUPPORTED_LIST_URLS[chainId].includes(url))
}

export function useInactiveListUrls(): string[] {
  // MOD: adds { chainId } support to the hooks
  const { chainId = DEFAULT_NETWORK_FOR_LISTS } = useActiveWeb3React()
  const lists = useAllLists()
  const allActiveListUrls = useActiveListUrls()
  return Object.keys(lists).filter(
    url => !allActiveListUrls?.includes(url) && !UNSUPPORTED_LIST_URLS[chainId].includes(url)
  )
}

// get all the tokens from active lists, combine with local default tokens
export function useCombinedActiveList(): TokenAddressMap {
  // MOD: added here to use the scoped functions
  const activeListUrls = useActiveListUrls()
  const activeTokens = useCombinedTokenMapFromUrls(activeListUrls)
  const defaultTokenMap = listToTokenMap(DEFAULT_TOKEN_LIST)
  return combineMaps(activeTokens, defaultTokenMap)
}

// all tokens from inactive lists
export function useCombinedInactiveList(): TokenAddressMap {
  // MOD: added here to use the scoped functions
  const allInactiveListUrls: string[] = useInactiveListUrls()
  return useCombinedTokenMapFromUrls(allInactiveListUrls)
}

// used to hide warnings on import for default tokens
export function useDefaultTokenList(): TokenAddressMap {
  // MOD: added here to use the scoped functions
  return listToTokenMap(DEFAULT_TOKEN_LIST)
}

// list of tokens not supported on interface, used to show warnings and prevent swaps and adds
export function useUnsupportedTokenList(): TokenAddressMap {
  // MOD: adds { chainId } support to the hooks
  const { chainId = DEFAULT_NETWORK_FOR_LISTS } = useActiveWeb3React()
  // get hard coded unsupported tokens
  const localUnsupportedListMap = listToTokenMap(UNSUPPORTED_TOKEN_LIST)

  // get any loaded unsupported tokens
  const loadedUnsupportedListMap = useCombinedTokenMapFromUrls(UNSUPPORTED_LIST_URLS[chainId])

  // format into one token address map
  return combineMaps(localUnsupportedListMap, loadedUnsupportedListMap)
}

export function useIsListActive(url: string): boolean {
  // MOD: added here to use the scoped functions
  const activeListUrls = useActiveListUrls()
  return Boolean(activeListUrls?.includes(url))
}
