import React from 'react'
// import { computeTradePriceBreakdown } from '../TradeSummary'
import SwapModalHeaderMod, { SwapModalHeaderProps } from './SwapModalHeaderMod'
import { AutoColumn } from 'components/Column'
import styled from 'styled-components'
import { StyledLogo } from 'components/CurrencyLogo'

const Wrapper = styled.div`
  svg {
    stroke: ${({ theme }) => theme.text1};
  }

  ${AutoColumn} > div > div {
    color: ${({ theme }) => theme.text1};
  }

  ${StyledLogo} {
    stroke: ${({ theme }) => theme.text2};
  }
`

export default function SwapModalHeader(props: SwapModalHeaderProps) {
  // const { priceImpactWithoutFee } = React.useMemo(() => computeTradePriceBreakdown(props.trade), [props.trade])
  return (
    <Wrapper>
      <SwapModalHeaderMod {...props} /*priceImpactWithoutFee={priceImpactWithoutFee}*/ />
    </Wrapper>
  )
}
