import { useCallback } from 'react'
import { useClearQuote, useUpdateQuote } from 'state/price/hooks'
import { registerOnWindow } from 'utils/misc'
import { FeeQuoteParams, getFeeQuote, getPriceQuote } from 'utils/operator'

/**
 * @returns callback that fetches a new quote and update the state
 */
export function useRefetchQuoteCallback() {
  const updateQuote = useUpdateQuote()
  const clearQuote = useClearQuote()
  registerOnWindow({ updateQuote })

  return useCallback(
    async ({ sellToken, buyToken, amount, kind, chainId }: FeeQuoteParams) => {
      // Get a new fee quote
      const feePromise = getFeeQuote({ chainId, sellToken, buyToken, amount, kind }).catch(err => {
        console.error('Error fetching the fee', err)
        return null
      })

      // Get a new price quote
      const pricePromise = getPriceQuote({ chainId, baseToken: sellToken, quoteToken: buyToken, amount, kind })

      const [fee, price] = await Promise.all([feePromise, pricePromise])
      if (fee && price) {
        // Update quote
        updateQuote({ sellToken, buyToken, amount, fee, price, chainId, lastCheck: Date.now() })
      } else {
        // Clear the fee
        clearQuote({ chainId, token: sellToken })
      }
    },
    [updateQuote, clearQuote]
  )
}
