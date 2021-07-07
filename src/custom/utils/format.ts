import BigNumber from 'bignumber.js'

import { formatSmart as _formatSmart } from '@gnosis.pm/dex-js'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

const TEN = new BigNumber(10)

export function formatAtoms(amount: string, decimals: number): string {
  return new BigNumber(amount).div(TEN.pow(decimals)).toString(10)
}

export function formatSmart(currency: CurrencyAmount<Currency> | undefined, precision: number) {
  if (!currency) return

  return _formatSmart({
    amount: currency.quotient.toString(),
    precision: currency.currency.decimals,
    decimals: precision,
  })
}
