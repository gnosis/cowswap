import React from 'react'
import styled from 'styled-components'
import TradePriceModComponent, { TradePriceProps } from './TradePriceMod'

const TradePriceMod = styled(TradePriceModComponent)``

export default function TradePrice(props: TradePriceProps) {
  return <TradePriceMod {...props} />
}
