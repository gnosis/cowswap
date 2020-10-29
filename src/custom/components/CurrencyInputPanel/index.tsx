import React from 'react'
import styled from 'styled-components'

import CurrencyInputPanelMod, { CurrencyInputPanelProps, CurrencySelect, InputRow } from './CurrencyInputPanelMod'

export const Wrapper = styled.div`
  // CSS Override
  color: white;
  background-color: red;

  ${InputRow} {
    background-color: blue;
  }

  ${CurrencySelect} {
    background-color: yellow;
  }
`
export function CurrencyInputPanel(props: CurrencyInputPanelProps) {
  return (
    <Wrapper>
      <CurrencyInputPanelMod {...props} />
    </Wrapper>
  )
}

export default CurrencyInputPanel
