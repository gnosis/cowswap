import { useCallback } from 'react'
import { useClearQuote, useUpdateQuote } from 'state/price/hooks'
import { registerOnWindow } from 'utils/misc'
import { FeeQuoteParams, getFeeQuote, getPriceQuote } from 'utils/operator'

export interface RefetchQuoteCallbackParmams {
  quoteParams: FeeQuoteParams
  fetchFee: boolean
}

/**
 * @returns callback that fetches a new quote and update the state
 */
export function useRefetchQuoteCallback() {
  const updateQuote = useUpdateQuote()
  const clearQuote = useClearQuote()
  registerOnWindow({ updateQuote })

  return useCallback(
    async ({ quoteParams, fetchFee }: RefetchQuoteCallbackParmams) => {
      const { sellToken, buyToken, amount, kind, chainId } = quoteParams

      // TODO: Use an util for this
      const baseToken = sellToken
      const quoteToken = buyToken

      // Get a new price quote
      const pricePromise = getPriceQuote({ chainId, baseToken, quoteToken, amount, kind })

      // Get a new fee quote (if required)
      const feePromise = fetchFee
        ? getFeeQuote({ chainId, sellToken, buyToken, amount, kind }).catch(err => {
            console.error('Error fetching the fee', err)
            return null
          })
        : Promise.resolve(null)

      const [fee, price] = await Promise.all([feePromise, pricePromise])
      if (fee || !fetchFee) {
        // Update quote
        updateQuote({
          sellToken,
          buyToken,
          amount,
          price,
          chainId,
          lastCheck: Date.now(),
          // Fee is only updated when fetchFee=true
          fee: fee || undefined
        })
      } else {
        // Clear the fee
        clearQuote({ chainId, token: sellToken })
      }
    },
    [updateQuote, clearQuote]
  )
}
