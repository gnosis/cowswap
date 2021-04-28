import { parseUnits } from 'ethers/lib/utils'
import { CurrencyAmount } from '@uniswap/sdk'

export const MINIMUM_TXS = '10'
export const AVG_APPROVE_COST_GWEI = '50000'
export const DEFAULT_GAS_FEE = parseUnits('50', 'gwei')

export const setNativeLowBalanceError = (nativeSymbol: string) =>
  new Error(
    `This ${nativeSymbol} wrapping operation may leave insufficient funds to cover any future on-chain transaction costs.`
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
