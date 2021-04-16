import React from 'react'
import styled from 'styled-components'
import { Separator } from 'components/Menu'
import { ArrowDown, AlertTriangle } from 'react-feather'
import { ButtonLight } from '../../Button/ButtonMod'
import { Currency, Token } from '@uniswap/sdk'
import { useCurrencyBalances } from 'state/wallet/hooks'
import { SHORT_PRECISION } from 'constants/index'

const Wrapper = styled.div`
  ${({ theme }) => theme.flexColumnNoWrap}
  background: ${({ theme }) => theme.bg2};
  align-items: center;
  justify-content: center;
  margin: auto;
  padding: 1rem;
  width: 100%;

  border-radius: ${({ theme }) => theme.buttonPrimary.borderRadius};
  font-size: smaller;

    > ${Separator} {
        margin: -0.3rem 0 0.6rem 0;
    }

  > ${ButtonLight} {
      background: ${({ theme }) => theme.bg1};
  }
`
const WarningWrapper = styled(Wrapper)`
  ${({ theme }) => theme.flexRowNoWrap}
  padding: 0.5rem;

  color: red;
  font-weight: 800;
  font-size: small;

  > svg {
    margin-right: 0.5rem;
  }

  > div {
    ${({ theme }) => theme.flexColumnNoWrap}
    align-items: flex-start;
    justify-content: center;
    font-size: smaller;
  }
`

const BalanceLabel = styled.p<{ background?: string }>`
  display: flex;
  justify-content: space-between;
  width: 90%;

  background: ${({ background = 'initial' }) => background};

  > span {
    &:first-child {
      margin-right: auto;
    }
  }
`

interface Params {
  account?: string
  native: Currency
  wrapped: Token
}

export default function EthWethWrap({ account, native, wrapped }: Params) {
  const wrappedSymbol = wrapped.symbol || 'wrapped native token'
  const nativeSymbol = native.symbol || 'native token'

  const [nativeBalance, wrappedBalance] = useCurrencyBalances(account, [native, wrapped])

  return (
    <Wrapper>
      <WarningWrapper>
        <AlertTriangle size={30} />
        <div>
          <span>Only {wrappedSymbol} can be used to swap.</span>
          <span>
            Wrap your {nativeSymbol} first or switch to {wrappedSymbol}
          </span>
        </div>
      </WarningWrapper>
      <BalanceLabel>
        <span>{nativeSymbol} balance:</span> <span>{nativeBalance?.toSignificant(SHORT_PRECISION) || '-'}</span>
      </BalanceLabel>
      <Separator />
      <ArrowDown size={14} />
      <BalanceLabel background="">
        <span>{wrappedSymbol} balance:</span>
        <span>{wrappedBalance?.toSignificant(SHORT_PRECISION) || '-'}</span>
      </BalanceLabel>
      <ButtonLight padding="0.5rem">Wrap my {nativeSymbol}</ButtonLight>
    </Wrapper>
  )
}
