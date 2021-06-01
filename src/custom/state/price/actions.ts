import { createAction } from '@reduxjs/toolkit'
import { ChainId } from '@uniswap/sdk'
import { QuoteInformationObject } from './reducer'

export type UpdateQuoteParams = QuoteInformationObject

export interface ClearQuoteParams {
  token: string // token address,
  chainId: ChainId
}

export interface SetLoadingQuoteParams {
  // is it loading
  loading: boolean
  // indicator of a necessary hard load
  // e.g param changes: user changes token, input amt, etc
  quoteData?: Pick<QuoteInformationObject, 'sellToken' | 'chainId'>
}

export const setLoadingQuote = createAction<SetLoadingQuoteParams>('price/setLoadingQuote')
export const updateQuote = createAction<UpdateQuoteParams>('price/updateQuote')
export const clearQuote = createAction<ClearQuoteParams>('price/clearQuote')

// TODO: Add actions to update only the price
