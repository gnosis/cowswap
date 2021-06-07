import { BigNumber } from '@ethersproject/bignumber'
import { useCallback } from 'react'
import { useClearQuote, useUpdateQuote } from 'state/price/hooks'
import { getCanonicalMarket, registerOnWindow } from 'utils/misc'
import { FeeQuoteParams, getFeeQuote, getPriceQuote } from 'utils/operator'
import {
  useAddGpUnsupportedToken,
  useIsUnsupportedTokenGp,
  useRemoveGpUnsupportedToken
} from 'state/lists/hooks/hooksMod'
import { FeeInformation, PriceInformation, QuoteInformationObject } from 'state/price/reducer'
import { AddGpUnsupportedTokenParams } from 'state/lists/actions'
import OperatorError, { ApiErrorCodes } from 'utils/operator/error'
import { onlyResolvesLast } from 'utils/async'
import { ClearQuoteParams, UpdateQuoteParams } from 'state/price/actions'
import { checkPromiseStatus } from 'utils'

export interface RefetchQuoteCallbackParmams {
  quoteParams: FeeQuoteParams
  fetchFee: boolean
  previousFee?: FeeInformation
}

type QuoteResult = [PromiseSettledResult<PriceInformation>, PromiseSettledResult<FeeInformation>]

async function _getQuote({ quoteParams, fetchFee, previousFee }: RefetchQuoteCallbackParmams): Promise<QuoteResult> {
  const { sellToken, buyToken, amount, kind, chainId } = quoteParams
  const { baseToken, quoteToken } = getCanonicalMarket({ sellToken, buyToken, kind })

  // Get a new fee quote (if required)
  const feePromise =
    fetchFee || !previousFee
      ? getFeeQuote({ chainId, sellToken, buyToken, amount, kind })
      : Promise.resolve(previousFee)

  // Get a new price quote
  let exchangeAmount
  let feeExceedsPrice = false
  if (kind === 'sell') {
    // Sell orders need to deduct the fee from the swapped amount
    // we need to check for 0/negative exchangeAmount should fee >= amount
    const { amount: fee } = await feePromise
    const result = BigNumber.from(amount).sub(fee)

    feeExceedsPrice = result.lte('0')

    exchangeAmount = !feeExceedsPrice ? result.toString() : null
  } else {
    // For buy orders, we swap the whole amount, then we add the fee on top
    exchangeAmount = amount
  }

  // Get price for price estimation
  const pricePromise =
    !feeExceedsPrice && exchangeAmount
      ? getPriceQuote({ chainId, baseToken, quoteToken, amount: exchangeAmount, kind })
      : // fee exceeds our price, is invalid
        Promise.reject(
          new OperatorError({
            errorType: ApiErrorCodes.FeeExceedsFrom,
            description: OperatorError.apiErrorDetails.FeeExceedsFrom
          })
        )

  // Promise.allSettled does NOT throw on 1 promise rejection
  // instead it returns PromiseSettledResult - which we can decide to consume later
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/allSettled
  return Promise.allSettled([pricePromise, feePromise])
}

// wrap _getQuote and only resolve once on several calls
const getQuote = onlyResolvesLast<QuoteResult>(_getQuote)

function _isValidOperatorError(error: any): error is OperatorError {
  return error instanceof OperatorError
}

interface HandleQuoteErrorParams {
  quoteData?: QuoteInformationObject
  error: unknown
  addUnsupportedToken: (params: AddGpUnsupportedTokenParams) => void
  clearQuote: (params: ClearQuoteParams) => void
  updateQuote: (params: UpdateQuoteParams) => void
}

function _handleQuoteError({ quoteData, error, addUnsupportedToken, clearQuote, updateQuote }: HandleQuoteErrorParams) {
  if (_isValidOperatorError(error) && quoteData) {
    switch (error.type) {
      case ApiErrorCodes.UnsupportedToken: {
        // TODO: will change with introduction of data prop in error responses
        const unsupportedTokenAddress = error.description.split(' ')[2]
        console.error(`${error.message}: ${error.description} - disabling.`)

        return addUnsupportedToken({
          chainId: quoteData.chainId,
          address: unsupportedTokenAddress,
          dateAdded: Date.now()
        })
      }
      case ApiErrorCodes.NotFound: {
        console.error(`${error.message}: ${error.description}!`)
        return clearQuote({
          token: quoteData.sellToken,
          chainId: quoteData.chainId
        })
      }
      case ApiErrorCodes.FeeExceedsFrom: {
        console.error(`${error.message}: ${error.description}!`)
        return updateQuote({
          ...quoteData,
          error: error.type
        })
      }
      default: {
        // some other operator error occurred, log it
        console.error(error)
        // Clear the quote
        return clearQuote({ chainId: quoteData.chainId, token: quoteData.sellToken })
      }
    }
  } else {
    // non-operator error log it
    console.error('An unknown error occurred:', error)
  }
}

/**
 * @returns callback that fetches a new quote and update the state
 */
export function useRefetchQuoteCallback() {
  const isUnsupportedTokenGp = useIsUnsupportedTokenGp()
  // dispatchers
  const updateQuote = useUpdateQuote()
  const clearQuote = useClearQuote()

  const addUnsupportedToken = useAddGpUnsupportedToken()
  const removeGpUnsupportedToken = useRemoveGpUnsupportedToken()

  registerOnWindow({ updateQuote, addUnsupportedToken, removeGpUnsupportedToken })

  return useCallback(
    async (params: RefetchQuoteCallbackParmams) => {
      let quoteData: QuoteInformationObject | undefined = undefined
      const { sellToken, buyToken, chainId } = params.quoteParams
      try {
        // Get the quote
        // price can be null if fee > price
        const { cancelled, data } = await getQuote(params)
        if (cancelled) {
          console.debug('[useRefetchPriceCallback] Canceled get quote price for', params)
          return
        }

        const [price, fee] = data as QuoteResult

        // promise.allSettled does NOT throw on first reject
        // we don't want it to, we are waiting for FEE and PRICE, if only one fails, why throw both away?
        quoteData = {
          ...params.quoteParams,
          fee: checkPromiseStatus(fee, undefined),
          price: checkPromiseStatus(price, undefined),
          lastCheck: Date.now()
        }

        // if any of the 2 returns rejected, we need to throw now
        // that we have the updated quoteData object
        if (fee.status === 'rejected') {
          throw fee.reason
        } else if (price.status === 'rejected') {
          throw price.reason
        }

        const previouslyUnsupportedToken = isUnsupportedTokenGp(sellToken) || isUnsupportedTokenGp(buyToken)
        // can be a previously unsupported token which is now valid
        // so we check against map and remove it
        if (previouslyUnsupportedToken) {
          console.debug('[useRefetchPriceCallback]::Previously unsupported token now supported - re-enabling.')

          removeGpUnsupportedToken({
            chainId,
            address: previouslyUnsupportedToken.address.toLowerCase()
          })
        }

        // Update quote
        updateQuote(quoteData)
      } catch (error) {
        _handleQuoteError({ error, quoteData, updateQuote, clearQuote, addUnsupportedToken })
      }
    },
    [isUnsupportedTokenGp, updateQuote, removeGpUnsupportedToken, clearQuote, addUnsupportedToken]
  )
}
