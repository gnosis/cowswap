import { TradeType } from '@uniswap/sdk'
import { basisPointsToPercent } from 'utils/index'
import { TradeWithFee } from './extension'

export function logTradeDetails(trade: TradeWithFee | undefined, allowedSlippage: number) {
  // don't do anything outside of dev env
  if (!trade || process.env.NODE_ENV !== 'development') return

  const exactIn = trade.tradeType === TradeType.EXACT_INPUT

  // Log Exact In Trade info
  if (exactIn) {
    console.debug(
      `[SwapMod::[SELL] Trade Constructed]`,
      `
      Type: SELL
      ==========
      Input Amount:         ${trade.inputAmount.toExact()}
      Output Amount:        ${trade.outputAmount.toExact()}
      ==========
      Fee Amount [as SELL]: ${trade.fee?.feeAsCurrency?.toExact()} ${trade.inputAmount.currency.symbol}
      Fee Amount [as BUY]:  ${trade.outputAmountWithoutFee &&
        trade.outputAmountWithoutFee.subtract(trade.outputAmount).toExact()} ${trade.outputAmount.currency.symbol}
      ==========
      Minimum Received:     ${trade.minimumAmountOut(basisPointsToPercent(allowedSlippage)).toExact()}
    `
    )
  } else {
    // Log Exact Out Trade info
    console.debug(
      `[SwapMod::[BUY] Trade Constructed]`,
      `
      Type: BUY
      =========
      Input Amount [w/FEE]: ${trade.inputAmountWithFee.toExact()}
      Output Amount:        ${trade.outputAmount.toExact()}
      =========
      Fee Amount [as SELL]: ${trade.fee?.feeAsCurrency?.toExact()} ${trade.inputAmount.currency.symbol}
      =========
      Maximum Sold:         ${trade.fee?.feeAsCurrency &&
        trade.maximumAmountIn(basisPointsToPercent(allowedSlippage)).toExact()}
    `
    )
  }
}

export interface ComparisonParams {
  typedAmount?: string
  token?: string
  fee?: string
  price?: string
}

export function _compareLastTrade(current: ComparisonParams, previous: ComparisonParams) {
  console.debug(
    '[useDerivedSwapInfo]: Changed in Trade swap configuration detected:',

    'Was:',
    previous,

    'Change:',
    current.typedAmount !== previous?.typedAmount
      ? '[Typed amount]:' + current.typedAmount + ' [Before]: ' + previous?.typedAmount
      : current.fee !== previous?.fee
      ? '[Fee amount]:' + current.fee + ' [Before]: ' + previous?.fee
      : current.price !== previous?.price
      ? '[Price amount]:' + current.price
      : current.token !== previous?.token
      ? '[Token]:' + current.token + ' [Before]: ' + previous?.token
      : 'No meaningful change detected.'
  )
  const shouldUpdate =
    // user input changed
    current.typedAmount !== previous?.typedAmount ||
    // user changed tokens
    current.token !== previous?.token ||
    // the fee changed
    current.fee !== previous?.fee ||
    // the price changed
    current.price !== previous?.price

  return shouldUpdate
}
