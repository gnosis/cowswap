// import { darken } from 'polished'
import React from 'react'
import styled, { css } from 'styled-components/macro'
import { darken } from 'polished'
import useLoadingWithTimeout from 'hooks/useLoadingWithTimeout'
import { useIsQuoteRefreshing } from 'state/price/hooks'
import { FeeInformationTooltipWrapper } from 'components/swap/FeeInformationTooltip'
import CurrencySearchModalUni from 'components/SearchModal/CurrencySearchModal'
import { ReactComponent as DropDown } from 'assets/images/dropdown.svg'

import CurrencyInputPanelMod, { CurrencyInputPanelProps } from './CurrencyInputPanelMod'
import { RowBetween } from 'components/Row'

import { StyledLogo } from 'components/CurrencyLogo'
import { LONG_LOAD_THRESHOLD } from 'constants/index'

export const CurrencySearchModal = styled(CurrencySearchModalUni)`
  > [data-reach-dialog-content] {
    background-color: ${({ theme }) => theme.bg1};
  }
`

export const Container = styled.div<{ hideInput: boolean; showAux?: boolean }>`
  border-radius: ${({ hideInput, showAux = false }) => (showAux ? '20px 20px 0 0' : hideInput ? '16px' : '20px')};
  border: 1px solid ${({ theme, hideInput }) => (hideInput ? ' transparent' : theme.bg2)};
  background-color: ${({ theme }) => theme.bg1};
  width: ${({ hideInput }) => (hideInput ? '100%' : 'initial')};
  :focus,
  :hover {
    /* border: 1px solid ${({ theme, hideInput }) => (hideInput ? ' transparent' : theme.bg3)}; */
  }
`

export const CurrencySelect = styled.button<{ selected: boolean; hideInput?: boolean }>`
  align-items: center;
  font-size: 24px;
  font-weight: 500;
  background-color: ${({ selected, theme }) => (selected ? theme.bg1 : theme.primary1)};
  border-radius: 16px;
  box-shadow: ${({ selected }) => (selected ? 'none' : '0px 6px 10px rgba(0, 0, 0, 0.075)')};
  outline: none;
  cursor: pointer;
  user-select: none;
  border: none;
  height: ${({ hideInput }) => (hideInput ? '2.8rem' : '2.4rem')};
  width: ${({ hideInput }) => (hideInput ? '100%' : 'initial')};
  padding: 0 8px;
  justify-content: space-between;
  margin-right: ${({ hideInput }) => (hideInput ? '0' : '12px')};
  z-index: 2;
  color: ${({ selected, theme }) =>
    selected ? theme.buttonCurrencySelect.colorSelected : theme.buttonCurrencySelect.color};
  transition: background-color 0.2s ease-in-out;

  &:focus {
    background-color: ${({ selected, theme }) => (selected ? theme.bg1 : theme.primary1)};
  }
  &:hover {
    background-color: ${({ theme }) => darken(0.05, theme.primary1)};
  }

  path {
    stroke: ${({ selected, theme }) =>
      selected ? theme.buttonCurrencySelect.colorSelected : theme.buttonCurrencySelect.color};
    stroke-width: 1.5px;
  }
`

export const InputPanel = styled.div<{ hideInput?: boolean }>`
  ${({ theme }) => theme.flexColumnNoWrap}
  position: relative;
  border-radius: ${({ hideInput }) => (hideInput ? '16px' : '20px')};
  background-color: ${({ theme, hideInput }) => (hideInput ? 'transparent' : theme.bg2)};
  z-index: 1;
  width: ${({ hideInput }) => (hideInput ? '100%' : 'initial')};
`

export const InputRow = styled.div<{ selected: boolean }>`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: center;
  padding: ${({ selected }) => (selected ? ' 1rem 1rem 0.75rem 1rem' : '1rem 1rem 0.75rem 1rem')};
  background: transparent;

  > input,
  > input::placeholder {
    background: transparent;
    color: inherit;
  }

  > input::placeholder {
    opacity: 0.5;
  }
`

export const Wrapper = styled.div<{ selected: boolean; showLoader: boolean }>`
  // CSS Override

  ${InputPanel} {
    background: transparent;
    color: ${({ theme }) => theme.currencyInput?.color};

    &:hover {
      color: ${({ theme }) => theme.currencyInput?.color};
    }
  }

  ${Container} {
    background: ${({ theme }) => (theme.currencyInput?.background ? theme.currencyInput?.background : theme.bg1)};
    border: ${({ theme }) =>
      theme.currencyInput?.border ? theme.currencyInput?.border : `border: 1px solid ${theme.bg2}`};
  }

  ${({ showLoader, theme }) =>
    showLoader &&
    css`
      #swap-currency-output ${Container} {
        position: relative;
        display: inline-block;

        overflow: hidden;
        &::after {
          position: absolute;
          top: 0;
          right: 0;
          bottom: 0;
          left: 0;
          transform: translateX(-100%);
          background-image: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0) 0,
            ${theme.shimmer1} 20%,
            ${theme.shimmer2} 60%,
            rgba(255, 255, 255, 0)
          );
          animation: shimmer 2s infinite;
          content: '';
        }

        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
      }
    `}

  ${RowBetween} {
    color: ${({ theme }) => theme.currencyInput?.color};
    opacity: 0.75;

    > div > div > span,
    > div > div,
    > div {
      color: ${({ theme }) => theme.currencyInput?.color};
      font-weight: 500;
    }
  }

  ${StyledLogo} {
    background: ${({ theme }) => theme.bg1};
  }
`

export const FixedContainer = styled.div`
  width: 100%;
  height: 100%;
  position: absolute;
  border-radius: 20px;
  background-color: ${({ theme }) => theme.bg1};
  opacity: 0.95;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
`

export const AuxInformationContainer = styled(Container)`
  &&&&& {
    background-color: ${({ theme }) => darken(0.0, theme.bg1 || theme.bg3)};
    margin: 0 auto;
    border-radius: 0 0 15px 15px;
    border-top: none;
  }

  > ${FeeInformationTooltipWrapper} {
    align-items: center;
    justify-content: space-between;
    margin: 0 16px;
    padding: 9px 0;
    font-weight: 600;
    font-size: 14px;

    > span {
      font-size: 18px;
      gap: 2px;
    }

    > span:first-child {
      font-size: 14px;
      display: flex;
      align-items: center;
    }

    > span > small {
      opacity: 0.75;
      font-size: 13px;
      font-weight: 500;
    }
  }
`

export const LabelRow = styled.div`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: center;
  color: ${({ theme }) => theme.currencyInput?.color};
  font-size: 0.75rem;
  line-height: 1rem;
  padding: 0 1rem 1rem;

  span:hover {
    cursor: pointer;
    color: ${({ theme }) => theme.currencyInput?.color};
  }
`

export const FiatRow = styled(LabelRow)`
  justify-content: flex-end;
`

export const Aligner = styled.span`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`

export const StyledDropDown = styled(DropDown)<{ selected: boolean }>`
  margin: 0 0.25rem 0 0.35rem;
  height: 35%;

  path {
    stroke: ${({ selected, theme }) => (selected ? theme.text1 : theme.white)};
    stroke-width: 1.5px;
  }
`

export const StyledTokenName = styled.span<{ active?: boolean }>`
  ${({ active }) => (active ? '  margin: 0 0.25rem 0 0.25rem;' : '  margin: 0 0.25rem 0 0.25rem;')}
  font-size:  ${({ active }) => (active ? '18px' : '18px')};
`

export const StyledBalanceMax = styled.button`
  background-color: transparent;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  color: ${({ theme }) => theme.primary4};
  opacity: ${({ disabled }) => (!disabled ? 1 : 0.4)};
  pointer-events: ${({ disabled }) => (!disabled ? 'initial' : 'none')};
  margin-left: 0.25rem;

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    margin-right: 0.5rem;
  `};
`

export function CurrencyInputPanel(props: CurrencyInputPanelProps) {
  const { currency } = props
  const isRefreshingQuote = useIsQuoteRefreshing()
  const showLoader = useLoadingWithTimeout(isRefreshingQuote, LONG_LOAD_THRESHOLD)
  return (
    <Wrapper selected={!!currency} showLoader={showLoader}>
      <CurrencyInputPanelMod {...props} />
    </Wrapper>
  )
}

export default CurrencyInputPanel
