import { useCallback, useRef, useState } from 'react'
import styled from 'styled-components/macro'
import { useOnClickOutside } from 'hooks/useOnClickOutside'
import { ChevronDown } from 'react-feather'
import { CurrencyAmount, Token } from '@uniswap/sdk-core'
import { Txt } from 'assets/styles/styled'
import CowProtocolLogo from 'components/CowProtocolLogo'
import { formatMax, formatSmart } from 'utils/format'
import { AMOUNT_PRECISION } from '@src/custom/constants'
import { FlexWrap, FlexCol } from './styled'

type VCOWDropdownProps = {
  balance?: CurrencyAmount<Token>
}

export default function VCOWDropdown({ balance }: VCOWDropdownProps) {
  const [open, setOpen] = useState(false)
  const toggle = useCallback(() => setOpen((open) => !open), [])
  const node = useRef<HTMLDivElement>(null)
  useOnClickOutside(node, open ? toggle : undefined)

  return (
    <Wrapper ref={node}>
      <DropdownWrapper onClick={toggle}>
        <span style={{ marginRight: '2px' }}>
          <VCOWBalance>
            <CowProtocolLogo size={46} />
            <ProfileFlexCol>
              <Txt fs={14}>Balance</Txt>
              <Txt fs={18} title={`${formatMax(balance)} vCOW`}>
                <strong>
                  {formatSmart(balance, AMOUNT_PRECISION, { thousandSeparator: true, isLocaleAware: true }) ?? '0'} vCOW
                </strong>
              </Txt>
            </ProfileFlexCol>
          </VCOWBalance>
        </span>
        <ChevronDown size={16} style={{ marginTop: '2px' }} strokeWidth={2.5} />
      </DropdownWrapper>
      {open && (
        <MenuFlyout>
          <FlexWrap>
            <FlexCol>
              <Txt fs={16}>Voting Power</Txt>
              <Txt fs={16}>Vesting</Txt>
              <Txt fs={16}>Total</Txt>
            </FlexCol>
            <FlexCol>
              <Txt fs={16}>000</Txt>
              <Txt fs={16}>000</Txt>
              <Txt fs={16}>000</Txt>
            </FlexCol>
          </FlexWrap>
        </MenuFlyout>
      )}
    </Wrapper>
  )
}

const Wrapper = styled.div`
  position: relative;
  display: inline;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    justify-self: end;
  `};

  ${({ theme }) => theme.mediaWidth.upToSmall`
    margin: 0 0.5rem 0 0;
    width: initial;
    text-overflow: ellipsis;
    flex-shrink: 1;
    justify-self: start;
  `};
`

const MenuFlyout = styled.span`
  background-color: ${({ theme }) => theme.bg4};
  border: 1px solid ${({ theme }) => theme.bg0};
  box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.01), 0px 4px 8px rgba(0, 0, 0, 0.04), 0px 16px 24px rgba(0, 0, 0, 0.04),
    0px 24px 32px rgba(0, 0, 0, 0.01);
  border-radius: 12px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  font-size: 1rem;
  position: absolute;
  right: 0;
  top: 4.5rem;
  z-index: 200;
  min-width: 247px;
`

export const DropdownWrapper = styled.button`
  align-items: center;
  background-color: ${({ theme }) => theme.bg4};
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.bg0};
  color: ${({ theme }) => theme.text1};
  display: inline-flex;
  flex-direction: row;
  font-weight: 700;
  font-size: 12px;
  height: 100%;
  padding: 0.2rem 0.4rem;

  :hover,
  :focus {
    cursor: pointer;
    outline: none;
    border: 1px solid ${({ theme }) => theme.bg3};
  }
`

export const VCOWBalance = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  flex-grow: 1;
  min-width: 215px;
  height: 56px;
  justify-content: center;
  border-radius: 12px;
  padding: 8px;
  background-color: ${({ theme }) => theme.bg4};
`

export const ProfileFlexCol = styled.div`
  display: flex;
  flex-grow: 1;
  align-items: flex-start;
  flex-direction: column;

  span {
    padding: 0 8px;
  }
`
