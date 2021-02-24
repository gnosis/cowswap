import { ChainId } from '@uniswap/sdk'
import { ListsState, ListState, Mutable } from './reducer'

export function buildListState({
  defaultListofLists,
  newListState,
  defaultActiveListUrls
}: {
  defaultListofLists: string[]
  newListState: ListState
  defaultActiveListUrls: string[]
}) {
  return {
    lastInitializedDefaultListOfLists: defaultListofLists,
    byUrl: {
      ...defaultListofLists.reduce<Mutable<ListsState['byUrl']>>((memo, listUrl) => {
        memo[listUrl] = newListState
        return memo
      }, {})
    },
    activeListUrls: defaultActiveListUrls
  }
}

const BASE_STORAGE_KEY = 'redux_localstorage_simple_lists'

export function buildKey(chainId?: ChainId) {
  const identifier = chainId ? `_${chainId}` : ''

  return BASE_STORAGE_KEY + identifier
}
