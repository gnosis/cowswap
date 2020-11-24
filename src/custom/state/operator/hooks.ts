import { useDispatch, useSelector } from 'react-redux'

import { AppDispatch, AppState } from '../index'
import { updateTip, clearTip, SerializedToken, Tip } from './actions'
import { OperatorState } from './reducer'

export const useTip = (tokenAddress: string): Tip | undefined => {
  const { tipsMap } = useSelector<AppState, OperatorState>(state => state.operator)

  return tipsMap[tokenAddress]?.tip
}

interface AddTipParams extends ClearTipParams {
  tip: Tip
}
type AddTipCallback = (addTokenParams: AddTipParams) => void

export const useAddTip = (): AddTipCallback => {
  const dispatch = useDispatch<AppDispatch>()
  return (addTokenParams: AddTipParams) => dispatch(updateTip(addTokenParams))
}

interface ClearTipParams {
  token: SerializedToken
}
type ClearTipCallback = (clearTokenParams: ClearTipParams) => void

export const useClearTip = (): ClearTipCallback => {
  const dispatch = useDispatch<AppDispatch>()
  return (clearTokenParams: ClearTipParams) => dispatch(clearTip(clearTokenParams))
}
