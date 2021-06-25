import React from 'react'
import styled from 'styled-components'
import TradeSummaryMod from './TradeSummaryMod'
import { RowFixed } from 'components/Row'
import TradeGp from 'state/swap/TradeGp'
import { Percent } from '@uniswap/sdk-core'

const Wrapper = styled.div`
  ${RowFixed} {
    > div {
      color: ${({ theme }) => theme.text1};
    }
  }
`

export default function TradeSummary({ trade, allowedSlippage }: { trade: TradeGp; allowedSlippage: Percent }) {
  return (
    <Wrapper>
      <TradeSummaryMod trade={trade} allowedSlippage={allowedSlippage} />
    </Wrapper>
  )
}
