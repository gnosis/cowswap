import React from 'react'
import styled from 'styled-components'
import { ImportToken as ImportTokenMod, ImportProps, Wrapper as WrapperMod } from './ImportTokenMod'

const Wrapper = styled.div`
  ${WrapperMod} {
    background: red;
    /* ${`.token-warning-container`} {
      background: ${({ theme }) => theme.bg4};
    } */
  }
`

export function ImportToken(props: ImportProps) {
  return (
    <Wrapper>
      <ImportTokenMod {...props} />
      <h1>Test!!!!!!!!!</h1>
    </Wrapper>
  )
}
