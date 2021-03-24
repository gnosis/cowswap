import { Currency, ETHER, Token } from '@uniswap/sdk'
import React, { useMemo } from 'react'
import styled from 'styled-components'

import EthereumLogo from 'assets/images/ethereum-logo.png'
import useHttpLocations from 'hooks/useHttpLocations'
import { WrappedTokenInfo } from 'state/lists/hooks'
import Logo from 'components/Logo'

export const getTokenLogoURL = (address: string) =>
  `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${address}/logo.png`

const StyledEthereumLogo = styled.img<{ size: string }>`
  width: ${({ size }) => size};
  height: ${({ size }) => size};
  box-shadow: 0px 6px 10px rgba(0, 0, 0, 0.075);
  border-radius: 24px;
`

const StyledLogo = styled(Logo)<{ size: string }>`
  width: ${({ size }) => size};
  height: ${({ size }) => size};
  border-radius: ${({ size }) => size};
  box-shadow: 0px 6px 10px rgba(0, 0, 0, 0.075);
  background-color: ${({ theme }) => theme.white};
`

export default function CurrencyLogo({
  currency,
  size = '24px',
  style,
  getTokenLogoUrlCustom
}: {
  currency?: Currency
  size?: string
  style?: React.CSSProperties
  getTokenLogoUrlCustom: (url: string) => string
}) {
  const uriLocations = useHttpLocations(currency instanceof WrappedTokenInfo ? currency.logoURI : undefined)

  const srcs: string[] = useMemo(() => {
    if (currency === ETHER) return []

    if (currency instanceof Token) {
      if (currency instanceof WrappedTokenInfo) {
        return [...uriLocations, getTokenLogoUrlCustom(currency.address)]
      }
      return [getTokenLogoUrlCustom(currency.address)]
    }
    return []
  }, [getTokenLogoUrlCustom, currency, uriLocations])

  // if (currency instanceof Token) {
  //   console.log('Token info', currency.symbol, currency)
  // }

  if (currency === ETHER) {
    return <StyledEthereumLogo src={EthereumLogo} size={size} style={style} />
  }

  return <StyledLogo size={size} srcs={srcs} alt={`${currency?.symbol ?? 'token'} logo`} style={style} />
}
