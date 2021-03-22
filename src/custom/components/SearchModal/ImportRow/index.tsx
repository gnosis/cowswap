import React, { CSSProperties } from 'react'
import ImportRowMod from './ImportRowMod'
import { Token } from '@uniswap/sdk'
import styled from 'styled-components'
import { ButtonPrimary } from 'components/Button'

const Wrapper = styled(ImportRowMod)`
  ${ButtonPrimary} {
    font-size: 12px;
  }
`

export default function ImportRow(props: {
  token: Token
  style?: CSSProperties
  dim?: boolean
  showImportView: () => void
  setImportToken: (token: Token) => void
}) {
  return <Wrapper {...props} />
}
