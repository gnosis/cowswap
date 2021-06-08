import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { AppDispatch, AppState } from 'state'
import {
  updateQuote,
  clearQuote,
  UpdateQuoteParams,
  ClearQuoteParams,
  setNewQuoteLoading,
  SetLoadingQuoteParams,
  setRefreshQuoteLoading
} from './actions'
import { QuoteInformationObject, QuotesMap } from './reducer'

type GetNewQuoteCallback = (quoteLoadingParams: SetLoadingQuoteParams) => void
type RefreshCurrentQuoteCallback = (quoteLoadingParams: Pick<SetLoadingQuoteParams, 'loading'>) => void
type AddPriceCallback = (addFeeParams: UpdateQuoteParams) => void
type ClearPriceCallback = (clearFeeParams: ClearQuoteParams) => void

export const useAllQuotes = ({
  chainId
}: Partial<Pick<ClearQuoteParams, 'chainId'>>): Partial<QuotesMap> | undefined => {
  return useSelector<AppState, Partial<QuotesMap> | undefined>(state => {
    const quotes = chainId && state.price.quotes[chainId]

    if (!quotes) return {}

    return quotes
  })
}

export const useQuote = ({ token, chainId }: Partial<ClearQuoteParams>): QuoteInformationObject | undefined => {
  return useSelector<AppState, QuoteInformationObject | undefined>(state => {
    const fees = chainId && state.price.quotes[chainId]

    if (!fees) return undefined

    return token ? fees[token] : undefined
  })
}

export const useIsQuoteLoading = () =>
  useSelector<AppState, boolean>(state => {
    return state.price.loading
  })

interface UseGetQuoteAndStatus {
  quote?: QuoteInformationObject
  isGettingNewQuote: boolean
  isRefreshingQuote: boolean
}

export const useGetQuoteAndStatus = (params: Partial<ClearQuoteParams>): UseGetQuoteAndStatus => {
  const quote = useQuote(params)
  const isLoading = useIsQuoteLoading()

  const isGettingNewQuote = Boolean(isLoading && !quote?.price.amount)
  const isRefreshingQuote = Boolean(isLoading && quote?.price.amount)

  return { quote, isGettingNewQuote, isRefreshingQuote }
}

export const useSetNewQuoteLoading = (): GetNewQuoteCallback => {
  const dispatch = useDispatch<AppDispatch>()
  return useCallback((quoteLoadingParams: SetLoadingQuoteParams) => dispatch(setNewQuoteLoading(quoteLoadingParams)), [
    dispatch
  ])
}

export const useSetRefreshQuoteLoading = (): RefreshCurrentQuoteCallback => {
  const dispatch = useDispatch<AppDispatch>()
  return useCallback(
    (quoteLoadingParams: Pick<SetLoadingQuoteParams, 'loading'>) =>
      dispatch(setRefreshQuoteLoading(quoteLoadingParams)),
    [dispatch]
  )
}

export const useUpdateQuote = (): AddPriceCallback => {
  const dispatch = useDispatch<AppDispatch>()
  return useCallback((updateQuoteParams: UpdateQuoteParams) => dispatch(updateQuote(updateQuoteParams)), [dispatch])
}

export const useClearQuote = (): ClearPriceCallback => {
  const dispatch = useDispatch<AppDispatch>()
  return useCallback((clearQuoteParams: ClearQuoteParams) => dispatch(clearQuote(clearQuoteParams)), [dispatch])
}

interface QuoteDispatchers {
  setNewQuoteLoading: GetNewQuoteCallback
  setRefreshQuoteLoading: RefreshCurrentQuoteCallback
  updateQuote: AddPriceCallback
  clearQuote: ClearPriceCallback
}

export const useQuoteDispatchers = (): QuoteDispatchers => {
  return {
    setNewQuoteLoading: useSetNewQuoteLoading(),
    setRefreshQuoteLoading: useSetRefreshQuoteLoading(),
    updateQuote: useUpdateQuote(),
    clearQuote: useClearQuote()
  }
}
