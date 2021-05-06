import { useCallback } from 'react'
import { useUpdateQuote, useClearQuote } from 'state/price/hooks'
import { registerOnWindow } from 'utils/misc'
import { FeeQuoteParams, getFeeQuote } from 'utils/operator'

/**
 * @returns callback that fetches a new quote and update the state
 */
export function useRefetchQuoteCallback() {
  const updateQuote = useUpdateQuote()
  const clearQuote = useClearQuote()
  registerOnWindow({ updateQuote })

  return useCallback(
    async ({ sellToken, buyToken, amount, kind, chainId }: FeeQuoteParams) => {
      // Get a new quote
      const fee = await getFeeQuote({ chainId, sellToken, buyToken, amount, kind }).catch(err => {
        console.error('Error fetching the fee', err)
        return null
      })

      // TODO: Get price too

      if (fee) {
        // Update quote
        updateQuote({ sellToken, buyToken, amount, fee, chainId, lastCheck: Date.now() })
      } else {
        // Clear the fee
        clearQuote({ chainId, token: sellToken })
      }
    },
    [updateQuote, clearQuote]
  )
}
