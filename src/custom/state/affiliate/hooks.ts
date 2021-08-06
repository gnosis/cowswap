import { useSelector } from 'react-redux'
import { AppState } from 'state'

export function useAppDataHash() {
  return useSelector<AppState, string>((state) => {
    return state.affiliate.appDataHash
  })
}
