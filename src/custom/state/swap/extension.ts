import { CurrencyAmount, Trade, Currency } from '@uniswap/sdk'
import { useTradeExactIn, useTradeExactOut } from 'hooks/Trades'
import { tryParseAmount } from './hooks'
import { basisPointsToPercent } from 'utils'
import { FeeInformation } from 'custom/utils/operator'

interface DetermineFee {
  inputAmount?: CurrencyAmount
  feeInformation?: FeeInformation
}

/**
 * DetermineFee
 * @description using the inputAmount, compares whether the minimalFee or the feeRatio is greater and returns
 */
function determineFee({ feeInformation, inputAmount }: DetermineFee): CurrencyAmount | null {
  if (!feeInformation || !inputAmount) return null

  const { minimalFee, feeRatio } = feeInformation
  const feePercent = feeRatio && basisPointsToPercent(feeRatio)
  const feeRatioAmount = feePercent ? inputAmount.multiply(feePercent) : null
  const minimalFeeAsCurrency = tryParseAmount(minimalFee, inputAmount.currency) ?? null

  if (!feeRatioAmount || !minimalFeeAsCurrency) {
    return (
      (feeRatioAmount &&
        tryParseAmount(feeRatioAmount.toSignificant(inputAmount.currency.decimals), inputAmount.currency)) ||
      minimalFeeAsCurrency
    )
  }

  const feeRatioAsCurrency =
    tryParseAmount(feeRatioAmount.toSignificant(inputAmount.currency.decimals), inputAmount.currency) || null

  const greaterFee = feeRatioAmount.greaterThan(minimalFeeAsCurrency) ? feeRatioAsCurrency : minimalFeeAsCurrency

  return greaterFee
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
  const feeAsCurrency = determineFee({
    feeInformation,
    inputAmount: parsedAmount
  })

  // Adjust sell input using fee
  const adjustedInputAmount =
    parsedAmount && feeAsCurrency && !feeAsCurrency.greaterThan(parsedAmount)
      ? parsedAmount?.subtract(feeAsCurrency)
      : undefined

  // Original Uni trade hook
  const inTrade = useTradeExactIn(adjustedInputAmount, outputCurrency ?? undefined)

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
  const feeAsCurrency = determineFee({
    feeInformation,
    inputAmount: outTrade?.inputAmount
  })

  return extendExactOutTrade({
    exactOutTrade: outTrade,
    feeAsCurrency: feeAsCurrency ?? undefined
  })
}

export { useTradeExactOutWithFee, useTradeExactInWithFee, extendExactInTrade, extendExactOutTrade, determineFee }
