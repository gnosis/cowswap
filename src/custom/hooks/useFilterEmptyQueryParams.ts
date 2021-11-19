import { useMemo, useEffect } from 'react'
import { useLocation, useHistory } from 'react-router-dom'

function useQueryParams() {
  const { search } = useLocation()

  return useMemo(() => new URLSearchParams(search), [search])
}

export function useFilterEmptyQueryParams() {
  const queryParams = useQueryParams()
  const history = useHistory()

  useEffect(() => {
    const keysForDel: string[] = []
    queryParams.forEach((value, key) => {
      if (value === '') {
        keysForDel.push(key)
      }
    })
    keysForDel.forEach((key) => queryParams.delete(key))

    history.replace({
      search: queryParams.toString(),
    })
  }, [history, queryParams])
}
