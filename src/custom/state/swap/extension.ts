import { CanonicalMarketParams, getCanonicalMarket } from 'utils/misc'
import { CurrencyAmount, Trade, Currency, JSBI, Token, TokenAmount, Price } from '@uniswap/sdk'
import { useTradeExactIn, useTradeExactOut } from 'hooks/Trades'
import { FeeInformation, PriceInformation, QuoteInformationObject } from 'state/price/reducer'

export type FeeForTrade = { feeAsCurrency: CurrencyAmount | undefined } & Pick<FeeInformation, 'amount'>

export type TradeWithFee = Trade & {
  inputAmountWithFee: CurrencyAmount
  outputAmountWithoutFee?: CurrencyAmount
  fee?: FeeForTrade
}

type TradeExecutionPrice = CanonicalMarketParams<CurrencyAmount | undefined> & { price?: PriceInformation }

function _constructTradePrice({ sellToken, buyToken, kind, price }: TradeExecutionPrice): Price | undefined {
  if (!sellToken || !buyToken || !price) return

  let executionPrice: Price | undefined
  // get canonical market tokens
  // to accurately create our Price
  const { baseToken, quoteToken } = getCanonicalMarket({
    sellToken,
    buyToken,
    kind
  })

  if (baseToken && quoteToken && price) {
    executionPrice = new Price(baseToken.currency, quoteToken.currency, baseToken.raw.toString(), price.amount)
  }
  return executionPrice
}

interface TradeParams {
  parsedAmount?: CurrencyAmount
  inputCurrency?: Currency | null
  outputCurrency?: Currency | null
  quote?: QuoteInformationObject
}

export const stringToCurrency = (amount: string, currency: Currency) =>
  currency instanceof Token ? new TokenAmount(currency, JSBI.BigInt(amount)) : CurrencyAmount.ether(JSBI.BigInt(amount))

/**
 * useTradeExactInWithFee
 * @description wraps useTradeExactIn and returns an extended trade object with the fee adjusted values
 */
export function useTradeExactInWithFee({
  parsedAmount: parsedInputAmount,
  inputCurrency,
  outputCurrency,
  quote
}: TradeParams): TradeWithFee | null {
  // Original Uni trade hook
  const originalTrade = useTradeExactIn(parsedInputAmount, outputCurrency ?? undefined)

  // make sure we have a typed in amount, a fee, and a price
  // else we can assume the trade will be null
  if (!parsedInputAmount || !originalTrade || !inputCurrency || !outputCurrency || !quote?.fee || !quote?.price)
    return null

  const feeAsCurrency = stringToCurrency(quote.fee.amount, inputCurrency)
  // Check that fee amount is not greater than the user's input amt
  const isValidFee = feeAsCurrency.lessThan(parsedInputAmount)
  // If the feeAsCurrency value is higher than we are inputting, return undefined
  // this makes sure `useTradeExactIn` returns null === no trade
  const feeAdjustedAmount = isValidFee ? parsedInputAmount.subtract(feeAsCurrency) : undefined
  // set final fee object
  const fee = {
    ...quote.fee,
    feeAsCurrency
  }
  // calculate our output without any fee, consuming price
  const outputAmountWithoutFee = stringToCurrency(quote.price.amount, outputCurrency)
  // set the Price object to attach to final Trade object
  const executionPrice = _constructTradePrice({
    // pass in our parsed sell amount (CurrencyAmount)
    sellToken: parsedInputAmount,
    // pass in our feeless outputAmount (CurrencyAmount)
    buyToken: outputAmountWithoutFee,
    kind: 'sell',
    price: quote?.price
  })

  // no price object or feeAdjusted amount? no trade
  if (!executionPrice || !feeAdjustedAmount) return null

  // calculate our output using external price
  const outputAmount = executionPrice.quote(feeAdjustedAmount)

  return {
    ...originalTrade,
    inputAmountWithFee: feeAdjustedAmount,
    outputAmount,
    outputAmountWithoutFee,
    minimumAmountOut: originalTrade.minimumAmountOut,
    maximumAmountIn: originalTrade.maximumAmountIn,
    fee,
    executionPrice
  }
}

/**
 * useTradeExactOutWithFee
 * @description wraps useTradeExactIn and returns an extended trade object with the fee adjusted values
 */
export function useTradeExactOutWithFee({
  parsedAmount: parsedOutputAmount,
  inputCurrency,
  quote
}: Omit<TradeParams, 'outputCurrency'>) {
  // Original Uni trade hook
  const outTrade = useTradeExactOut(inputCurrency ?? undefined, parsedOutputAmount)

  if (!outTrade || !parsedOutputAmount || !inputCurrency || !quote?.fee || !quote?.price) return null

  const feeAsCurrency = stringToCurrency(quote.fee.amount, inputCurrency)
  // set final fee object
  const fee = {
    ...quote.fee,
    feeAsCurrency
  }

  // calculate our output using external price
  const inputAmount = stringToCurrency(quote.price.amount, inputCurrency)
  // We need to determine the fee after, as the parsedOutputAmount isn't known beforehand
  // Using feeInformation info, determine whether minimalFee greaterThan or lessThan feeRatio * sellAmount
  const inputAmountWithFee = inputAmount.add(feeAsCurrency)

  // per unit price
  const executionPrice = _constructTradePrice({
    // pass in our calculated inputAmount (CurrencyAmount)
    sellToken: inputAmount,
    // pass in our parsed buy amount (CurrencyAmount)
    buyToken: parsedOutputAmount,
    kind: 'buy',
    price: quote.price
  })

  // no price object? no trade
  if (!executionPrice) return null

  // We need to override the Trade object to use different values as we are intercepting initial inputs
  return {
    ...outTrade,
    // overriding inputAmount is a hack
    // to allow us to not have to change Uni's pages/swap/index and use different method names
    inputAmount: inputAmountWithFee,
    inputAmountWithFee,
    minimumAmountOut: outTrade.minimumAmountOut,
    maximumAmountIn: outTrade.maximumAmountIn,
    fee,
    executionPrice
  }
}
