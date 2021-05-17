import React from 'react'
import { computeTradePriceBreakdown, FEE_TOOLTIP_MSG } from '../TradeSummary'
import SwapModalFooterMod, { SwapModalFooterProps } from './SwapModalFooterMod'
import { StyledBalanceMaxMini } from 'components/swap/styleds'
import styled from 'styled-components'

const Wrapper = styled.div`
  background: red !important;

  #swap-page ${StyledBalanceMaxMini} {
    background-color: red !important;
    color: green !important;

    :hover {
      background-color: ${({ theme }) => theme.bg3};
    }
    :focus {
      background-color: ${({ theme }) => theme.bg3};
    }
  }
`

export default function SwapModalFooter(props: Omit<SwapModalFooterProps, 'fee' | 'priceImpactWithoutFee'>) {
  const { /*priceImpactWithoutFee,*/ realizedFee } = React.useMemo(() => computeTradePriceBreakdown(props.trade), [
    props.trade
  ])

  return (
    <Wrapper>
      <SwapModalFooterMod
        {...props}
        fee={{
          feeTitle: 'Fee',
          feeAmount: realizedFee,
          feeTooltip: FEE_TOOLTIP_MSG
        }}
        // priceImpactWithoutFee={priceImpactWithoutFee}
      />
    </Wrapper>
  )
}
