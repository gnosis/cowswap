import { darken } from 'polished'
import React from 'react'
import styled from 'styled-components'

import CurrencyInputPanelMod, { CurrencyInputPanelProps, CurrencySelect, InputRow } from './CurrencyInputPanelMod'

export const Wrapper = styled.div<{ selected: boolean }>`
  // CSS Override
  ${InputRow} {
  }

  ${CurrencySelect} {
    :focus,
    :hover {
      background-color: ${({ selected, theme }) => (selected ? 'red' : darken(0.05, 'red'))};
    }
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
