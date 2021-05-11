import { useCallback } from 'react'
import { useClearQuote, useUpdateQuote } from 'state/price/hooks'
import { getCanonicalMarket, registerOnWindow } from 'utils/misc'
import { ErrorHandlingResponse, FeeQuoteParams, getFeeQuote, getPriceQuote } from 'utils/operator'
import { PriceInformation, UnsupportedToken } from 'state/price/reducer'
import { useAddUnsupportedToken, useDynamicallyUnsupportedTokens } from 'state/unsupportedTokens/hooks'

export interface RefetchQuoteCallbackParmams {
  quoteParams: FeeQuoteParams
  fetchFee: boolean
}

function handleError(err: any): undefined {
  console.error('Error fetching price/fee', err)
  return undefined
}

// quote endpoint can return error we want to consume
const _validResponse = <T, E = UnsupportedToken>(response?: ErrorHandlingResponse<T, E>) => {
  if (!response || response.error) return false

  return Boolean(response.data)
}

/**
 * @returns callback that fetches a new quote and update the state
 */
export function useRefetchQuoteCallback() {
  const updateQuote = useUpdateQuote()
  const clearQuote = useClearQuote()
  const unsupportedTokensMap = useDynamicallyUnsupportedTokens()
  const addUnsupportedToken = useAddUnsupportedToken()
  registerOnWindow({ updateQuote })

  return useCallback(
    async ({ quoteParams, fetchFee }: RefetchQuoteCallbackParmams) => {
      const { sellToken, buyToken, amount, kind, chainId } = quoteParams
      const { baseToken, quoteToken } = getCanonicalMarket({ sellToken, buyToken, kind })

      // Get a new price quote
      const pricePromise = getPriceQuote({ chainId, baseToken, quoteToken, amount, kind }).catch(handleError)

      // Get a new fee quote (if required)
      const feePromise = fetchFee
        ? getFeeQuote({ chainId, sellToken, buyToken, amount, kind }).catch(handleError)
        : undefined

      const [fee, price] = await Promise.all([feePromise, pricePromise])
      // use typecheck on returned fee/price response
      // can be a valid FeeInformation/Price object
      // or an UnsupportedToken error response
      if ((_validResponse(fee) || !fetchFee) && _validResponse(price)) {
        // Update quote
        // fee.data can still be undefined
        // price.data CANNOT be undefined (L22)
        // TODO: check this
        updateQuote({
          sellToken,
          buyToken,
          amount,
          // TS hates the typecheck on L52, price.data is not undefined
          price: price?.data as PriceInformation,
          chainId,
          lastCheck: Date.now(),
          // Fee is only updated when fetchFee=true
          fee: fee?.data
        })
      } else if ((price && !_validResponse(price)) || (fee && !_validResponse(fee))) {
        const unsupportedToken = (price?.error || fee?.error) as UnsupportedToken
        // unsupported token error, mark token as such
        // TODO: will likely change with server response including a data.address
        // field for UnsupportedToken error responses
        const address = unsupportedToken.description.split(' ')[2]
        console.debug('[UNSUPPORTED TOKEN!]::', address)
        if (unsupportedTokensMap?.[address]) return
        addUnsupportedToken({
          chainId,
          address
        })
      } else {
        // Clear the fee
        clearQuote({ chainId, token: sellToken })
      }
    },
    [updateQuote, unsupportedTokensMap, addUnsupportedToken, clearQuote]
  )
}
