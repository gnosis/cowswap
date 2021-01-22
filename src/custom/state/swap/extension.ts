import { CurrencyAmount, Trade, Currency } from '@uniswap/sdk'
import { useTradeExactIn, useTradeExactOut } from 'hooks/Trades'
import { tryParseAmount } from './hooks'
import { basisPointsToPercent } from 'utils'
import { FeeInformation } from 'custom/utils/operator'

interface DetermineFee {
  inputAmount: CurrencyAmount
  feeInformation: FeeInformation
}

/**
 * DetermineFee
 * @description using the inputAmount, compares whether the minimalFee or the feeRatio is greater and returns
 * @description accepts fractional values
 */
function determineFee({ feeInformation, inputAmount }: DetermineFee): CurrencyAmount | undefined {
  const { feeRatio, minimalFee } = feeInformation

  // We need to consider some cases here:
  // Case 1: No feeInformation - return null
  // Case 2: No feeRatio, but minimalFee
  //   Case2a: is minimalFee >= inputAmount? - return null
  //   Case2b: minimalFee < inputAmount - return fee
  // Case 3: feeRatio && minimalFee
  //  Case 3a: feeRatio * inputAmount > minimalFee - return feeRatio
  //  Case 3b: feeRatio * inputAmount <= minimalFee - return minimalFee
  //  Case 3c: feeRatio exists && minimalFee > inputAmount - return feeRatio

  // MINIMAL FEE
  const minimalFeeAsCurrency = tryParseAmount(minimalFee, inputAmount.currency)

  // FEE_RATIO AS PERCENT
  const feeRatioAmount = inputAmount.multiply(basisPointsToPercent(feeRatio))
  const feeRatioAsCurrency = tryParseAmount(
    feeRatioAmount.toSignificant(inputAmount.currency.decimals),
    inputAmount.currency
  )

  if (minimalFeeAsCurrency && feeRatioAsCurrency) {
    // Which is bigger? feeRatio * inputAmount OR the minimalFee?
    return feeRatioAsCurrency.greaterThan(minimalFeeAsCurrency) ? feeRatioAsCurrency : minimalFeeAsCurrency
  } else {
    // One or neither is valid, return that one
    return minimalFeeAsCurrency || feeRatioAsCurrency
  }
}

interface ExtendedTradeParams {
  exactInTrade?: Trade | null
  exactOutTrade?: Trade | null
  typedAmountAsCurrency?: CurrencyAmount
  feeAsCurrency?: CurrencyAmount
}

/**
 * extendExactInTrade
 * @description takes a Uni ExactIn Trade object and returns a custom one with fee adjusted inputAmount
 */
function extendExactInTrade(params: Pick<ExtendedTradeParams, 'exactInTrade' | 'typedAmountAsCurrency'>) {
  const { exactInTrade, typedAmountAsCurrency } = params

  if (!exactInTrade || !typedAmountAsCurrency) return null

  // We need to iverride the Trade object to use different values as we are intercepting initial inputs
  // and applying fee. For ExactIn orders, we leave outputAmount as is
  // and only change inputAmount to show the original entry before fee calculation
  return {
    ...exactInTrade,
    inputAmount: typedAmountAsCurrency,
    inputAmountWithFees: exactInTrade.inputAmount,
    minimumAmountOut: exactInTrade.minimumAmountOut,
    maximumAmountIn: exactInTrade.maximumAmountIn
  }
}

/**
 * extendExactOutTrade
 * @description takes a Uni ExactOut Trade object and returns a custom one with fee adjusted inputAmount
 */
function extendExactOutTrade(params: Pick<ExtendedTradeParams, 'exactOutTrade' | 'feeAsCurrency'>) {
  const { exactOutTrade, feeAsCurrency } = params

  if (!exactOutTrade || !feeAsCurrency) return null

  const inputAmountWithFee = exactOutTrade.inputAmount.add(feeAsCurrency)
  // We need to override the Trade object to use different values as we are intercepting initial inputs
  // and applying fee. For ExactOut orders, we leave inputAmount as is
  // and only change outputAm to show the original entry before fee calculation
  return {
    ...exactOutTrade,
    inputAmount: inputAmountWithFee,
    minimumAmountOut: exactOutTrade.minimumAmountOut,
    maximumAmountIn: exactOutTrade.maximumAmountIn
  }
}

interface TradeParams {
  parsedAmount?: CurrencyAmount
  inputCurrency?: Currency | null
  outputCurrency?: Currency | null
  feeInformation?: FeeInformation
}

/**
 * useTradeExactInWithFee
 * @description wraps useTradeExactIn and returns an extended trade object with the fee adjusted values
 */
function useTradeExactInWithFee({ parsedAmount, outputCurrency, feeInformation }: Omit<TradeParams, 'inputCurrency'>) {
  // Using feeInformation info, determine whether minimalFee greaterThan or lessThan feeRatio * sellAmount
  let fee: CurrencyAmount | undefined
  if (parsedAmount && feeInformation) {
    fee = determineFee({
      feeInformation,
      inputAmount: parsedAmount
    })
  }

  let inputAmount: CurrencyAmount | undefined = parsedAmount
  if (parsedAmount && fee) {
    // we have a fee, but is it less than the input amount?
    const validFee = fee.lessThan(parsedAmount)
    // fee < parsedAmount, return difference, else return undefined (no trade)
    inputAmount = validFee ? parsedAmount.subtract(fee) : undefined
  }

  // Original Uni trade hook
  const inTrade = useTradeExactIn(inputAmount, outputCurrency ?? undefined)

  return extendExactInTrade({
    exactInTrade: inTrade,
    typedAmountAsCurrency: parsedAmount
  })
}

/**
 * useTradeExactOutWithFee
 * @description wraps useTradeExactIn and returns an extended trade object with the fee adjusted values
 */
function useTradeExactOutWithFee({ parsedAmount, inputCurrency, feeInformation }: Omit<TradeParams, 'outputCurrency'>) {
  // Original Uni trade hook
  const outTrade = useTradeExactOut(inputCurrency ?? undefined, parsedAmount)

  // We need to determine the fee after, as the inputAmount isn't known beforehand
  // Using feeInformation info, determine whether minimalFee greaterThan or lessThan feeRatio * sellAmount
  let fee: CurrencyAmount | undefined
  if (outTrade?.inputAmount && feeInformation) {
    fee = determineFee({
      feeInformation,
      inputAmount: outTrade.inputAmount
    })
  }
  return extendExactOutTrade({
    exactOutTrade: outTrade,
    feeAsCurrency: fee
  })
}

export { useTradeExactOutWithFee, useTradeExactInWithFee, extendExactInTrade, extendExactOutTrade, determineFee }
