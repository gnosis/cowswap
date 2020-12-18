import { ChainId } from '@uniswap/sdk'
import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { AppDispatch, AppState } from 'state'
import { updateFee, clearFee } from './actions'
import { FeeInformation } from './reducer'

interface AddFeeParams extends ClearFeeParams {
  fee: FeeInformation
}
interface ClearFeeParams {
  token: string // token address,
  chainId: ChainId
}

type AddFeeCallback = (addTokenParams: AddFeeParams) => void
type ClearFeeCallback = (clearTokenParams: ClearFeeParams) => void

export const useFee = ({ token, chainId }: ClearFeeParams): FeeInformation | undefined => {
  return useSelector<AppState, FeeInformation | undefined>(state => {
    const fees = state.fee[chainId]

    if (!fees) return undefined

    return token ? fees.feesMap[token]?.fee : undefined
  })
}

export const useAddFee = (): AddFeeCallback => {
  const dispatch = useDispatch<AppDispatch>()
  return useCallback((addTokenParams: AddFeeParams) => dispatch(updateFee(addTokenParams)), [dispatch])
}

export const useClearFee = (): ClearFeeCallback => {
  const dispatch = useDispatch<AppDispatch>()
  return useCallback((clearTokenParams: ClearFeeParams) => dispatch(clearFee(clearTokenParams)), [dispatch])
}
