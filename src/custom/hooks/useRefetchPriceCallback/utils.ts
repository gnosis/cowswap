import { BigNumber } from '@ethersproject/bignumber'
import BigNumberJs from 'bignumber.js'
import { AddGpUnsupportedTokenParams } from 'state/lists/actions'
import { QuoteError } from 'state/price/actions'
import { PriceInformation, FeeInformation, QuoteInformationObject } from 'state/price/reducer'
import { onlyResolvesLast } from 'utils/async'
import { formatAtoms } from 'utils/format'
import { isPromiseFulfilled, getCanonicalMarket } from 'utils/misc'
import { PriceQuoteParams, getBestPriceQuote, getFeeQuote, FeeQuoteParams } from 'utils/operator'
import { OptimalRatesWithPartnerFees } from 'paraswap'
import { toPriceInformation } from 'utils/paraswap'
import { isValidOperatorError, ApiErrorCodes } from 'utils/operator/errors/OperatorError'
import GpQuoteError, { GpQuoteErrorCodes, isValidQuoteError } from 'utils/operator/errors/QuoteError'
import { OrderKind } from 'utils/signatures'
import { isOnline } from 'hooks/useIsOnline'
import { RefetchQuoteCallbackParams } from '../useRefetchPriceCallback'

export type QuoteResult = [PromiseSettledResult<PriceInformation>, PromiseSettledResult<FeeInformation>]

const FEE_EXCEEDS_FROM_ERROR = new GpQuoteError({
  errorType: GpQuoteErrorCodes.FeeExceedsFrom,
  description: GpQuoteError.quoteErrorDetails.FeeExceedsFrom,
})

export class PriceQuoteError extends Error {
  params: PriceQuoteParams
  results: PromiseSettledResult<any>[]

  constructor(message: string, params: PriceQuoteParams, results: PromiseSettledResult<any>[]) {
    super(message)
    this.params = params
    this.results = results
  }
}

type PriceSource = 'gnosis-protocol' | 'paraswap'
type PriceInformationWithSource = PriceInformation & { source: PriceSource; data?: any }
type PromiseRejectedResultWithSource = PromiseRejectedResult & { source: PriceSource }

type FilterWinningPriceParams = {
  kind: string
  amounts: string[]
  priceQuotes: PriceInformationWithSource[]
}

export function filterWinningPrice(params: FilterWinningPriceParams) {
  // Take the best price: Aggregate all the amounts into a single one.
  //  - Use maximum of all the result for "Sell orders":
  //        You want to get the maximum number of buy tokens
  //  - Use minimum "Buy orders":
  //        You want to spend the min number of sell tokens
  const aggregationFunction = params.kind === OrderKind.SELL ? 'max' : 'min'
  const amount = BigNumberJs[aggregationFunction](...params.amounts).toString(10)
  const token = params.priceQuotes[0].token
  // console.log('Aggregated amounts', aggregationFunction, amounts, amount)

  const winningPrices = params.priceQuotes
    .filter((quote) => quote.amount === amount)
    .map((p) => p.source)
    .join(', ')
  console.log('[util::filterWinningPrice] Winning price: ' + winningPrices)

  return { token, amount }
}

export function extractPriceAndErrorPromiseValues(
  priceResult: PromiseSettledResult<PriceInformation>,
  paraSwapPriceResult: PromiseSettledResult<OptimalRatesWithPartnerFees | null>
): [Array<PriceInformationWithSource>, Array<PromiseRejectedResultWithSource>] {
  // Prepare an array with all successful estimations
  const priceQuotes: Array<PriceInformationWithSource> = []
  const errorsGetPrice: Array<PromiseRejectedResultWithSource> = []

  if (isPromiseFulfilled(priceResult)) {
    priceQuotes.push({ ...priceResult.value, source: 'gnosis-protocol' })
  } else {
    errorsGetPrice.push({ ...priceResult, source: 'gnosis-protocol' })
  }

  if (isPromiseFulfilled(paraSwapPriceResult)) {
    const paraswapPrice = toPriceInformation(paraSwapPriceResult.value)
    paraswapPrice && priceQuotes.push({ ...paraswapPrice, source: 'paraswap', data: paraSwapPriceResult.value })
  } else {
    errorsGetPrice.push({ ...paraSwapPriceResult, source: 'paraswap' })
  }

  return [priceQuotes, errorsGetPrice]
}

/**
 *
 * @returns The best price among GPv2 API or Paraswap one
 */
async function _getBestPriceQuote(params: PriceQuoteParams): Promise<PriceInformation> {
  // Get price from all API: Gpv2 and Paraswap
  const [priceResult, paraSwapPriceResult] = await getBestPriceQuote(params)

  // Prepare an array with all successful estimations
  const [priceQuotes, errorsGetPrice] = extractPriceAndErrorPromiseValues(priceResult, paraSwapPriceResult)

  if (errorsGetPrice.length > 0) {
    const sourceNames = errorsGetPrice.map((e) => e.source).join(', ')
    console.error('[utils::useRefetchPriceCallback] Some API failed or timed out: ' + sourceNames, errorsGetPrice)
  }

  if (priceQuotes.length > 0) {
    const sourceNames = priceQuotes.map((p) => p.source).join(', ')
    console.log('[utils::useRefetchPriceCallback] Get best price succeeded for ' + sourceNames, priceQuotes)
    const amounts = priceQuotes.map((quote) => quote.amount).filter(Boolean) as string[]

    return filterWinningPrice({ kind: params.kind, amounts, priceQuotes })
  } else {
    throw new PriceQuoteError('Error querying price from APIs', params, [priceResult, paraSwapPriceResult])
  }
}

async function _getQuote({ quoteParams, fetchFee, previousFee }: RefetchQuoteCallbackParams): Promise<QuoteResult> {
  const { sellToken, buyToken, fromDecimals, toDecimals, amount, kind, chainId } = quoteParams
  const { baseToken, quoteToken } = getCanonicalMarket({ sellToken, buyToken, kind })

  // Get a new fee quote (if required)
  const feePromise =
    fetchFee || !previousFee
      ? getFeeQuote({ chainId, sellToken, buyToken, fromDecimals, toDecimals, amount, kind })
      : Promise.resolve(previousFee)

  // Log fee for debugging
  feePromise.then((fee) => {
    console.log(`Fee: ${formatAtoms(fee.amount, fromDecimals)} (in atoms ${fee.amount})`)
    return fee
  })

  // Get a new price quote
  let exchangeAmount
  let feeExceedsPrice = false
  if (kind === 'sell') {
    // Sell orders need to deduct the fee from the swapped amount
    // we need to check for 0/negative exchangeAmount should fee >= amount
    const { amount: fee } = await feePromise
    const result = BigNumber.from(amount).sub(fee)
    console.log(`Sell amount before fee: ${formatAtoms(amount, fromDecimals)}  (in atoms ${amount})`)
    console.log(`Sell amount after fee: ${formatAtoms(result.toString(), fromDecimals)}  (in atoms ${result})`)

    feeExceedsPrice = result.lte('0')

    exchangeAmount = !feeExceedsPrice ? result.toString() : null
  } else {
    // For buy orders, we swap the whole amount, then we add the fee on top
    exchangeAmount = amount
  }

  // Get price for price estimation
  const pricePromise =
    !feeExceedsPrice && exchangeAmount
      ? _getBestPriceQuote({ chainId, baseToken, quoteToken, fromDecimals, toDecimals, amount: exchangeAmount, kind })
      : // fee exceeds our price, is invalid
        Promise.reject(FEE_EXCEEDS_FROM_ERROR)

  return Promise.allSettled([pricePromise, feePromise])
}

// wrap _getQuote and only resolve once on several calls
export const getQuote = onlyResolvesLast<QuoteResult>(_getQuote)

interface HandleQuoteErrorParams {
  quoteData: QuoteInformationObject | FeeQuoteParams
  error: unknown
  addUnsupportedToken: (params: AddGpUnsupportedTokenParams) => void
}

export function handleQuoteError({ quoteData, error, addUnsupportedToken }: HandleQuoteErrorParams): QuoteError {
  if (isValidOperatorError(error)) {
    switch (error.type) {
      case ApiErrorCodes.UnsupportedToken: {
        // TODO: will change with introduction of data prop in error responses
        const unsupportedTokenAddress = error.description.split(' ')[2]
        console.error(`${error.message}: ${error.description} - disabling.`)

        // Add token to unsupported token list
        addUnsupportedToken({
          chainId: quoteData.chainId,
          address: unsupportedTokenAddress,
          dateAdded: Date.now(),
        })

        return 'unsupported-token'
      }

      default: {
        // some other operator error occurred, log it
        console.error('Error quoting price/fee. Unhandled operator error: ' + error.type, error)

        return 'fetch-quote-error'
      }
    }
  } else if (isValidQuoteError(error)) {
    switch (error.type) {
      // Fee/Price query returns error
      // e.g Insufficient Liquidity or Fee exceeds Price
      case GpQuoteErrorCodes.FeeExceedsFrom: {
        return 'fee-exceeds-sell-amount'
      }

      case GpQuoteErrorCodes.InsufficientLiquidity: {
        console.error(`Insufficient liquidity ${error.message}: ${error.description}`)
        return 'insufficient-liquidity'
      }

      default: {
        // Some other operator error occurred, log it
        console.error('Error quoting price/fee. Unhandled operator error: ' + error.type, error)

        return 'fetch-quote-error'
      }
    }
  } else {
    // Detect if the error was because we are now offline
    if (!isOnline()) {
      return 'offline-browser'
    }

    // Some other error getting the quote ocurred
    console.error('Error quoting price/fee: ' + error)
    return 'fetch-quote-error'
  }
}
