import React, { CSSProperties } from 'react'
import styled from 'styled-components'
import { Token } from '@uniswap/sdk'
import ImportRowMod from './ImportRowMod'
import { StyledLogo } from 'components/CurrencyLogo'

const Wrapper = styled.div`
  ${StyledLogo} {
    color: ${({ theme }) => theme.text2};
  }
`

export default function ImportRow(props: {
  token: Token
  style?: CSSProperties
  dim?: boolean
  showImportView: () => void
  setImportToken: (token: Token) => void
}) {
  return (
    <Wrapper>
      <ImportRowMod {...props} />
    </Wrapper>
  )
}
