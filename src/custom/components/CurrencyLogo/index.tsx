import React from 'react'
import { Currency } from '@uniswap/sdk'
import CurrencyLogoMod, { getTokenLogoURL as getTokenLogoURLUni } from './CurrencyLogoMod'
export * from './CurrencyLogoMod'

/**
 * Just some basic overrides as a temporal solution to show Rinkeby/xDAI token images
 */
const addressOverrides: Map<string, string> = new Map([
  ['0xc778417e063141139fce010982780140aa0cd5ab', '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2']
])

export function getTokenLogoURL(address: string): string {
  const overrideAddress = addressOverrides.get(address.toLowerCase()) || address
  return getTokenLogoURLUni(overrideAddress)
  // return 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png'
}

export default function CurrencyLogo({
  currency,
  size = '24px',
  style
}: {
  currency?: Currency
  size?: string
  style?: React.CSSProperties
}) {
  return <CurrencyLogoMod currency={currency} size={size} style={style} getTokenLogoUrlCustom={getTokenLogoURL} />
}
