import React from 'react'
import { CurrencyAmount, Currency } from '@uniswap/sdk'
import styled from 'styled-components'
import CurrencyLogo from 'components/CurrencyLogo'
import { SHORT_PRECISION } from 'constants/index'

const BalanceLabel = styled.p<{ background?: string }>`
  display: flex;
  justify-content: center;
  margin: 0.5rem 0;
  width: 100%;

  border-radius: ${({ theme }) => theme.buttonPrimary.borderRadius};

  background: ${({ background = 'initial' }) => background};

  > span {
    &:first-child {
      margin-right: 0.2rem;
    }
  }
`

const WrapCardWrapper = styled.div`
  ${({ theme }) => theme.flexColumnNoWrap}
  align-items: center;
  justify-content: center;
  flex: 1;
  padding: 0.5rem;
`

export const WrapCardContainer = styled.div`
  position: relative;
  ${({ theme }) => theme.flexRowNoWrap}
  border: 0.15rem solid ${({ theme }) => theme.bg1};
  border-radius: ${({ theme }) => theme.buttonPrimary.borderRadius};
  margin: 0.7rem 0;
  width: 100%;

  > ${WrapCardWrapper} {
    &:nth-of-type(even) {
      background-color: ${({ theme }) => theme.bg1};
    }

    > ${BalanceLabel}:last-child {
      margin: 0;
    }
  }

  // arrow
  > svg {
    position: absolute;
    left: calc(50% - 15px);
    top: calc(50% - 15px);
    border-radius: 100%;
    background: #fff;
    width: 30px;
    height: 30px;
    padding: 5px;
  }
`

interface WrapCardProps {
  symbol: string
  balance?: CurrencyAmount
  amountToWrap?: CurrencyAmount
  currency: Currency
}

export function WrapCard(props: WrapCardProps) {
  const { symbol, balance, amountToWrap, currency } = props
  return (
    <WrapCardWrapper>
      {/* logo */}
      <CurrencyLogo currency={currency} size="24px" />
      {/* amount to wrap/unwrap */}
      <BalanceLabel>
        <strong>
          {amountToWrap?.toSignificant(SHORT_PRECISION) || '-'} {symbol}
        </strong>
      </BalanceLabel>
      {/* user balance */}
      <BalanceLabel>
        <span>Balance: </span>
        <span>{balance?.toSignificant(SHORT_PRECISION) || '-'}</span>
      </BalanceLabel>
    </WrapCardWrapper>
  )
}
