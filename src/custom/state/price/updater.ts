import { useEffect } from 'react'
import { useActiveWeb3React } from 'hooks'
import { useSwapState, tryParseAmount } from 'state/swap/hooks'
import useIsWindowVisible from 'hooks/useIsWindowVisible'
import { Field } from 'state/swap/actions'
import { useCurrency } from 'hooks/Tokens'
import useDebounce from 'hooks/useDebounce'
import { useAllQuotes } from './hooks'
import { useRefetchQuoteCallback } from 'hooks/useRefetchQuoteCallback'
import { FeeQuoteParams } from 'utils/operator'
import { QuoteInformationObject } from './reducer'

const DEBOUNCE_TIME = 350
const REFETCH_CHECK_INTERVAL = 10000 // Every 10s
const RENEW_FEE_QUOTES_BEFORE_EXPIRATION_TIME = 30000 // Will renew the quote if there's less than 30 seconds left for the quote to expire
const WAITING_TIME_BETWEEN_EQUAL_REQUESTS = 10000 // Prevents from sending the same request to often (max, every 10s)
/**
 * Returns true if the fee quote expires soon (in less than RENEW_FEE_QUOTES_BEFORE_EXPIRATION_TIME milliseconds)
 */
function wasCheckedRecently(lastFeeCheck: number): boolean {
  return lastFeeCheck + WAITING_TIME_BETWEEN_EQUAL_REQUESTS > Date.now()
}

/**
 * Returns true if the fee quote expires soon (in less than RENEW_FEE_QUOTES_BEFORE_EXPIRATION_TIME milliseconds)
 */
function isFeeExpiringSoon(quoteExpirationIsoDate: string): boolean {
  const feeExpirationDate = Date.parse(quoteExpirationIsoDate)
  const secondsLeft = (feeExpirationDate.valueOf() - Date.now()) / 1000

  const needRefetch = feeExpirationDate <= Date.now() + RENEW_FEE_QUOTES_BEFORE_EXPIRATION_TIME
  console.log(`[state:price:updater] Fee isExpiring in ${secondsLeft}. Refetch?`, needRefetch)

  return needRefetch
}

/**
 * Checks if the parameters for the current quote are correct
 *
 * Quotes are only valid for a given token-pair and amount. If any of these parameter change, the fee needs to be re-fetched
 */
function feeMatchesCurrentParameters(currentParams: FeeQuoteParams, feeInfo: QuoteInformationObject): boolean {
  const { amount: currentAmount, sellToken: currentSellToken, buyToken: currentBuyToken } = currentParams
  const { amount, buyToken, sellToken } = feeInfo

  return sellToken === currentSellToken && buyToken === currentBuyToken && amount === currentAmount
}

/**
 *  Decides if we need to refetch the fee information given the current parameters (selected by the user), and the current feeInfo (in the state)
 */
function isRefetchQuoteRequired(currentParams: FeeQuoteParams, feeInfo?: QuoteInformationObject): boolean {
  if (feeInfo) {
    if (!feeMatchesCurrentParameters(currentParams, feeInfo)) {
      // If the current parameters don't match the fee, the fee information is invalid and needs to be re-fetched
      return true
    }

    // The query params are the same, so we only ask for a new quote if:
    //  - If the quote was not queried recently
    //  - The quote will expire soon

    if (wasCheckedRecently(feeInfo.lastCheck)) {
      // Don't Re-fetch if it was queried recently
      return false
    } else {
      // Re-fetch if the quote is expiring soon
      return isFeeExpiringSoon(feeInfo.fee.expirationDate)
    }
  } else {
    // If there's no fee information, we always re-fetch
    return true
  }
}

export default function FeesUpdater(): null {
  const { chainId } = useActiveWeb3React()
  const {
    INPUT: { currencyId: sellToken },
    OUTPUT: { currencyId: buyToken },
    independentField,
    typedValue: rawTypedValue
  } = useSwapState()

  // Debounce the typed value to not refetch the fee too often
  // Fee API calculation/call
  const typedValue = useDebounce(rawTypedValue, DEBOUNCE_TIME)

  const sellCurrency = useCurrency(sellToken)
  const buyCurrency = useCurrency(buyToken)
  const quotesMap = useAllQuotes({ chainId })
  const quoteInfo = quotesMap && sellToken ? quotesMap[sellToken] : undefined

  const refetchQuote = useRefetchQuoteCallback()
  const windowVisible = useIsWindowVisible()

  // Update if any parameter is changing
  useEffect(() => {
    // Don't refetch if window is not visible, or some parameter is missing
    if (!chainId || !sellToken || !buyToken || !typedValue || !windowVisible) return

    const kind = independentField === Field.INPUT ? 'sell' : 'buy'
    const amount = tryParseAmount(typedValue, (kind === 'sell' ? sellCurrency : buyCurrency) ?? undefined)

    // Don't refetch if the amount is missing
    if (!amount) return

    // Callback to re-fetch both the fee and the price
    const refetchFeeAndPriceIfRequired = () => {
      const quoteParams = { buyToken, chainId, sellToken, kind, amount: amount.raw.toString() }
      if (isRefetchQuoteRequired(quoteParams, quoteInfo)) {
        refetchQuote(quoteParams).catch(error => console.error('Error re-fetching the fee', error))
      }
      // TODO: refetchPrice if necesary
    }

    // Refetch fee and price if any parameter changes
    refetchFeeAndPriceIfRequired()

    // Periodically re-fetch the fee/price, even if the user don't change the parameters
    // Note that refetchFee won't refresh if it doesn't need to (i.e. the quote is valid for a long time)
    const intervalId = setInterval(() => {
      refetchFeeAndPriceIfRequired()
    }, REFETCH_CHECK_INTERVAL)

    return () => clearInterval(intervalId)
  }, [
    windowVisible,
    chainId,
    sellToken,
    buyToken,
    independentField,
    typedValue,
    sellCurrency,
    buyCurrency,
    quoteInfo,
    refetchQuote
  ])

  return null
}
