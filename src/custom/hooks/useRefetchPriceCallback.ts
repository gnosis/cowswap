import { useCallback } from 'react'
import { useClearQuote, useUpdateQuote } from 'state/price/hooks'
import { getCanonicalMarket, registerOnWindow } from 'utils/misc'
import { FeeQuoteParams, getFeeQuote, getPriceQuote } from 'utils/operator'
import { UnsupportedToken } from 'state/price/reducer'
import { isFeeOrPriceInformation, isUnsupportedToken } from 'state/price/utils'
import { useAddUnsupportedToken, useDynamicallyUnsupportedTokens } from 'state/unsupportedTokens/hooks'

export interface RefetchQuoteCallbackParmams {
  quoteParams: FeeQuoteParams
  fetchFee: boolean
}

function handleError(err: any): undefined {
  console.error('Error fetching price/fee', err)
  return undefined
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
      if (isFeeOrPriceInformation(fee) && isFeeOrPriceInformation(price)) {
        // Update quote
        // TODO: check this
        if ((fee || !fetchFee) && price) {
          updateQuote({
            sellToken,
            buyToken,
            amount,
            price,
            chainId,
            lastCheck: Date.now(),
            // Fee is only updated when fetchFee=true
            fee
          })
        }
      } else if (isUnsupportedToken(price) || isUnsupportedToken(fee)) {
        const unsupportedToken = isUnsupportedToken(price) ? price : (fee as UnsupportedToken)
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
