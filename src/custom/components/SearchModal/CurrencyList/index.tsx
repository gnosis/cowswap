import React from 'react'
import styled from 'styled-components'
import { CurrencyAmount } from '@uniswap/sdk'

import { LONG_PRECISION } from 'constants/index'

import CurrencyListMod, { StyledBalanceText, Tag } from './CurrencyListMod'
import { StyledLogo } from 'components/CurrencyLogo'
import { MenuItem } from 'components/SearchModal/styleds'

const Wrapper = styled.div`
  ${MenuItem} {
    &:hover {
      background-color: ${({ theme }) => theme.bg4};
    }
  }

  ${StyledLogo} {
    background: ${({ theme }) => theme.bg1};
  }

  ${Tag} {
    background: ${({ theme }) => theme.bg2};
    color: ${({ theme }) => theme.text2};
  }
`

export function Balance({ balance }: { balance: CurrencyAmount }) {
  return <StyledBalanceText title={balance.toExact()}>{balance.toSignificant(LONG_PRECISION)}</StyledBalanceText>
}

export default function CurrencyList(
  ...paramsList: Parameters<typeof CurrencyListMod>
): ReturnType<typeof CurrencyListMod> {
  const [params] = paramsList
  return (
    <Wrapper>
      <CurrencyListMod {...params} BalanceComponent={Balance} />
    </Wrapper>
  )
}
