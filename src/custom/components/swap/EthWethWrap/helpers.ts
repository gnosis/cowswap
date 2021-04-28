import { parseUnits } from 'ethers/lib/utils'
import { CurrencyAmount } from '@uniswap/sdk'
import { DEFAULT_PRECISION } from 'constants/index'

export const MINIMUM_TXS = '10'
export const AVG_APPROVE_COST_GWEI = '50000'
export const DEFAULT_GAS_FEE = parseUnits('50', 'gwei')

export const setNativeLowBalanceError = (nativeSymbol: string, lowBalanceThreshold: CurrencyAmount) =>
  new Error(
    `WARNING! After wrapping your ${nativeSymbol}, your balance will fall below < ${lowBalanceThreshold.toSignificant(
      DEFAULT_PRECISION
    )} ${nativeSymbol}. As a result you may not have sufficient ${nativeSymbol} left to cover future on-chain transaction costs.`
  )

export function isLowBalanceCheck({
  threshold,
  txCost,
  userInput,
  balance
}: {
  threshold: CurrencyAmount
  txCost: CurrencyAmount
  userInput?: CurrencyAmount
  balance?: CurrencyAmount
}) {
  if (!userInput || !balance || userInput.add(txCost).greaterThan(balance)) return true
  // OK if: users_balance - (amt_input + 1_tx_cost) > low_balance_threshold
  return balance.subtract(userInput.add(txCost)).lessThan(threshold)
}
