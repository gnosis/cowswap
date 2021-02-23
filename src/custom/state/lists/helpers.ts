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
