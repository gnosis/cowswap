// import { darken } from 'polished'
import React from 'react'
import styled from 'styled-components'

import CurrencyInputPanelMod, { CurrencyInputPanelProps, CurrencySelect, InputRow } from './CurrencyInputPanelMod'

export const Wrapper = styled.div<{ selected: boolean }>`
  // CSS Override

  ${InputRow} {
  }

  ${CurrencySelect} {
    background-color: transparent;
    background: ${({ theme }) => theme.buttonCurrencySelect.background};
    box-shadow: ${({ theme }) => theme.buttonCurrencySelect.boxShadow};
    border: ${({ theme }) => theme.buttonCurrencySelect.border};
    color: ${({ theme }) => theme.buttonCurrencySelect.color};
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
