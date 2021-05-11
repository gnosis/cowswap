import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { ChainId } from '@uniswap/sdk'
import { AppDispatch, AppState } from 'state'
import { UnsupportedTokensState } from 'state/unsupportedTokens/reducer'
import { addUnsupportedToken, removeUnsupportedToken, UnsupportedTokenParams } from './actions'

export function useDynamicallyUnsupportedTokens(chainId?: ChainId) {
  return useSelector<AppState, UnsupportedTokensState[ChainId]>(state => {
    return chainId && state.unsupportedTokens[chainId]
  })
}

export function useAddUnsupportedToken() {
  const dispatch = useDispatch<AppDispatch>()
  return useCallback(
    (addUnsupportedTokenParams: UnsupportedTokenParams) => dispatch(addUnsupportedToken(addUnsupportedTokenParams)),
    [dispatch]
  )
}

export function useRemoveUnsupportedToken() {
  const dispatch = useDispatch<AppDispatch>()
  return useCallback(
    (removeUnsupportedTokenParams: UnsupportedTokenParams) =>
      dispatch(removeUnsupportedToken(removeUnsupportedTokenParams)),
    [dispatch]
  )
}
