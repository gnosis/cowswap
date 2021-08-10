import BigNumber from 'bignumber.js'

import { formatSmart as _formatSmart } from '@gnosis.pm/dex-js'
import { Currency, CurrencyAmount, Percent, Fraction } from '@uniswap/sdk-core'
import { DEFAULT_DECIMALS, DEFAULT_PRECISION, DEFAULT_SMALL_LIMIT } from 'constants/index'

const TEN = new BigNumber(10)

export function formatAtoms(amount: string, decimals: number): string {
  return new BigNumber(amount).div(TEN.pow(decimals)).toString(10)
}

export interface FormatSmartOptions {
  thousandSeparator?: boolean
  smallLimit?: string
  isLocaleAware?: boolean
}

function _buildSmallLimit(smallLimit: string | undefined, decimalsToShow: number): string {
  if (smallLimit) {
    // explicitly set, use that
    return smallLimit
  }
  if (decimalsToShow < 1) {
    // special case when there's no decimal to display
    return '1'
  }
  if (decimalsToShow < DEFAULT_PRECISION) {
    // showing less than default precision, adjust small limit to avoid something like:
    // < 0.0000000001 when decimals to show =2 and the value is 0.00312
    return '0.' + '0'.repeat(decimalsToShow - 1) + '1'
  }
  // stick to default smallLimit (0.000001), which matches DEFAULT_PRECISION (6)
  return DEFAULT_SMALL_LIMIT
}

/**
 * formatSmart
 * @param value
 * @param decimalsToShow
 * @param options
 * @returns string or undefined
 */
export function formatSmart(
  value: CurrencyAmount<Currency> | Percent | Fraction | null | undefined,
  decimalsToShow: number = DEFAULT_PRECISION,
  options?: FormatSmartOptions
) {
  if (!value) return

  const precision = value instanceof CurrencyAmount ? value.currency.decimals : 0
  const amount = value instanceof CurrencyAmount ? value.quotient.toString() : value.toFixed(decimalsToShow)
  // Take the min(decimalsToShow, token decimals) because a token can have less decimals than the what we want to show
  const smallLimitPrecision = Math.min(decimalsToShow, precision ?? DEFAULT_DECIMALS)

  return _formatSmart({
    amount,
    precision,
    decimals: decimalsToShow,
    thousandSeparator: !!options?.thousandSeparator,
    smallLimit: _buildSmallLimit(options?.smallLimit, smallLimitPrecision),
    isLocaleAware: !!options?.isLocaleAware,
  })
}
