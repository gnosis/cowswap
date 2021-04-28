import React from 'react'
import styled from 'styled-components'
import ToggleUni, { ToggleProps } from '@src/components/Toggle'

export * from '@src/components/Toggle'

const Wrapper = styled(ToggleUni)`
  .disabled {
    color: ${({ theme }) => theme.white};
  }
`

export default function Toggle(props: ToggleProps) {
  return <Wrapper {...props} />
}
