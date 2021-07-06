import { useCallback } from 'react'
import { useQuoteDispatchers } from 'state/price/hooks'

import { registerOnWindow, getPromiseFulfilledValue, isPromiseFulfilled } from 'utils/misc'
import { FeeQuoteParams } from 'utils/operator'
import {
  useAddGpUnsupportedToken,
  useIsUnsupportedTokenGp,
  useRemoveGpUnsupportedToken,
} from 'state/lists/hooks/hooksMod'
import { FeeInformation, QuoteInformationObject } from 'state/price/reducer'
import { getQuote, handleQuoteError, QuoteResult } from './utils'

export interface RefetchQuoteCallbackParams {
  quoteParams: FeeQuoteParams
  fetchFee: boolean
  previousFee?: FeeInformation
  isPriceRefresh: boolean
}

/**
 * @returns callback that fetches a new quote and update the state
 */
export function useRefetchQuoteCallback() {
  const isUnsupportedTokenGp = useIsUnsupportedTokenGp()
  // dispatchers
  const { getNewQuote, refreshQuote, updateQuote, setQuoteError } = useQuoteDispatchers()
  const addUnsupportedToken = useAddGpUnsupportedToken()
  const removeGpUnsupportedToken = useRemoveGpUnsupportedToken()

  registerOnWindow({
    getNewQuote,
    refreshQuote,
    updateQuote,
    setQuoteError,
    addUnsupportedToken,
    removeGpUnsupportedToken,
  })

  return useCallback(
    async (params: RefetchQuoteCallbackParams) => {
      const { quoteParams, isPriceRefresh } = params
      let quoteData: FeeQuoteParams | QuoteInformationObject = quoteParams

      const { sellToken, buyToken, chainId } = quoteData
      try {
        // Start action: Either new quote or refreshing quote
        if (isPriceRefresh) {
          // Refresh the quote
          refreshQuote({ sellToken, chainId })
        } else {
          // Get new quote
          getNewQuote(quoteParams)
        }

        // Get the quote
        // price can be null if fee > price
        const { cancelled, data } = await getQuote(params)
        if (cancelled) {
          // Cancellation can happen if a new request is made, then any ongoing query is canceled
          console.debug('[useRefetchPriceCallback] Canceled get quote price for', params)
          return
        }

        const [price, fee] = data as QuoteResult

        quoteData = {
          ...quoteParams,
          fee: getPromiseFulfilledValue(fee, undefined),
          price: getPromiseFulfilledValue(price, undefined),
        }
        // check the promise fulfilled values
        // handle if rejected
        if (!isPromiseFulfilled(fee)) {
          // fee error takes precedence
          throw fee.reason
        } else if (!isPromiseFulfilled(price)) {
          throw price.reason
        }

        const previouslyUnsupportedToken = isUnsupportedTokenGp(sellToken) || isUnsupportedTokenGp(buyToken)
        // can be a previously unsupported token which is now valid
        // so we check against map and remove it
        if (previouslyUnsupportedToken) {
          console.debug('[useRefetchPriceCallback]::Previously unsupported token now supported - re-enabling.')

          removeGpUnsupportedToken({
            chainId,
            address: previouslyUnsupportedToken.address.toLowerCase(),
          })
        }

        // Update quote
        updateQuote(quoteData)
      } catch (error) {
        // handle any errors in quote fetch
        // we re-use the quoteData object in scope to save values into state
        const quoteError = handleQuoteError({
          error,
          quoteData,
          addUnsupportedToken,
        })

        // Set quote error
        setQuoteError({
          ...quoteData,
          error: quoteError,
        })
      }
    },
    [
      isUnsupportedTokenGp,
      updateQuote,
      removeGpUnsupportedToken,
      setQuoteError,
      addUnsupportedToken,
      getNewQuote,
      refreshQuote,
    ]
  )
}
