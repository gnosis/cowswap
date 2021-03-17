// import { darken } from 'polished'
import React from 'react'
import styled from 'styled-components'
import { darken } from 'polished'

import CurrencyInputPanelMod, {
  CurrencyInputPanelProps,
  CurrencySelect as CurrencySelectMod,
  InputRow
} from './CurrencyInputPanelMod'

export const Wrapper = styled.div<{ selected: boolean }>`
  // CSS Override

  ${InputRow} {
    background: transparent;
    > input {
      background: transparent;
    }
  }
`

export const CurrencySelect = styled(CurrencySelectMod)<{ selected: boolean }>`
  background-color: ${({ selected, theme }) => (selected ? theme.bg1 : theme.buttonCurrencySelect.background)};
  color: ${({ selected, theme }) =>
    selected ? theme.buttonCurrencySelect.colorSelected : theme.buttonCurrencySelect.color};
  box-shadow: ${({ selected, theme }) => (selected ? 'none' : theme.buttonCurrencySelect.boxShadow)};
  border: ${({ theme }) => theme.buttonCurrencySelect.border};

  :focus,
  :hover {
    background-color: ${({ selected, theme }) =>
      selected ? theme.bg2 : darken(0.05, theme.buttonCurrencySelect.background)};
  }
`

export function CurrencyInputPanel(props: CurrencyInputPanelProps) {
  const { currency } = props
  return (
    <Wrapper selected={!!currency}>
      <CurrencyInputPanelMod {...props} />
    </Wrapper>
  )
}

export default CurrencyInputPanel
