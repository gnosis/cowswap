import React from 'react'
import styled from 'styled-components'
import { ImportToken as ImportTokenMod, ImportProps, Wrapper as WrapperMod } from './ImportTokenMod'
import Card from 'components/Card'
import { AutoRow } from 'components/Row'
import { StyledLogo } from 'components/CurrencyLogo'

const Wrapper = styled.div`
  ${WrapperMod} {
    ${Card} ${AutoRow},
    ${Card} ${AutoRow} > ${StyledLogo} ~ div {
      color: ${({ theme }) => theme.text2};
    }
  }
`

export function ImportToken(props: ImportProps) {
  return (
    <Wrapper>
      <ImportTokenMod {...props} />
    </Wrapper>
  )
}
