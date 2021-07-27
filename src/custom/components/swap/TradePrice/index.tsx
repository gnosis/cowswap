import React, { useMemo } from 'react'
import { CurrencyAmount } from '@uniswap/sdk-core'
import TradePriceMod, { TradePriceProps } from './TradePriceMod'
import { useUSDCValue } from 'hooks/useUSDCPrice'
import { formatSmart } from 'utils/format'
import { registerOnWindow } from 'custom/utils/misc'
import { tryParseAmount } from 'state/swap/hooks'
import { SHORT_PRECISION } from '@src/custom/constants'

export * from './TradePriceMod'

export default function TradePrice(props: Omit<TradePriceProps, 'fiatValue'>) {
  const { price, showInverted } = props

  const priceSide = useMemo(
    () =>
      !showInverted
        ? tryParseAmount(price.invert().toFixed(), price.baseCurrency)
        : tryParseAmount(price.toFixed(), price.quoteCurrency),
    [price, showInverted]
  )
  const amount = useUSDCValue(priceSide)
  const fiatValueFormatted = formatSmart(amount, SHORT_PRECISION) ?? '-'

  return <TradePriceMod {...props} fiatValue={fiatValueFormatted} />
}
registerOnWindow({ currencyAmt: CurrencyAmount })
