import React from 'react'
import styled from 'styled-components'

import CurrencyInputPanelMod, { CurrencyInputPanelProps, CurrencySelect, InputRow } from './CurrencyInputPanelMod'

export const Wrapper = styled.div`
  // CSS Override
  ${InputRow} {
  }

  ${CurrencySelect} {
    background-color: red;
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