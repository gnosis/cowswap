import { useSelector } from 'react-redux'
import { AppState } from '../..'
import { ChainId } from '@uniswap/sdk'
import { useActiveWeb3React } from 'hooks'
import { DEFAULT_NETWORK_FOR_LISTS } from 'constants/lists'
import { TokenList } from '@uniswap/token-lists'

export * from '@src/state/lists/hooks'

export function useAllLists(): {
  readonly [url: string]: {
    readonly current: TokenList | null
    readonly pendingUpdate: TokenList | null
    readonly loadingRequestId: string | null
    readonly error: string | null
  }
} {
  const { chainId = DEFAULT_NETWORK_FOR_LISTS } = useActiveWeb3React()
  // return useSelector<AppState, AppState['lists']['byUrl']>(state => state.lists.byUrl)
  return useSelector<AppState, AppState['lists'][ChainId]['byUrl']>(state => state.lists[chainId].byUrl)
}
