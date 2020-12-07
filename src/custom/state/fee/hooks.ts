import { useDispatch, useSelector } from 'react-redux'

import { AppDispatch, AppState } from 'state'
import { updateFee, clearFee } from './actions'
import { FeeInformationState, FeeInformation } from './reducer'

interface AddFeeParams extends ClearFeeParams {
  fee: FeeInformation
}
interface ClearFeeParams {
  token: string // token address
}

type AddFeeCallback = (addTokenParams: AddFeeParams) => void
type ClearFeeCallback = (clearTokenParams: ClearFeeParams) => void

export const useFee = (tokenAddress?: string): FeeInformation | undefined => {
  const { feesMap } = useSelector<AppState, FeeInformationState>(state => state.fee)

  return tokenAddress ? feesMap[tokenAddress]?.fee : undefined
}

export const useAddTip = (): AddFeeCallback => {
  const dispatch = useDispatch<AppDispatch>()
  return (addTokenParams: AddFeeParams) => dispatch(updateFee(addTokenParams))
}

export const useClearTip = (): ClearFeeCallback => {
  const dispatch = useDispatch<AppDispatch>()
  return (clearTokenParams: ClearFeeParams) => dispatch(clearFee(clearTokenParams))
}
