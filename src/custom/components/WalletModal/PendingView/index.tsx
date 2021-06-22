import { AbstractConnector } from '@web3-react/abstract-connector'
import React from 'react'
import styled from 'styled-components'
import PendingViewMod from './PendingViewMod'

const Wrapper = styled.div`
  color: ${({ theme }) => theme.text2};
`

export default function PendingView(props: {
  connector?: AbstractConnector
  error?: boolean
  setPendingError: (error: boolean) => void
  tryActivation: (connector: AbstractConnector) => void
}) {
  return (
    <Wrapper>
      <PendingViewMod {...props} />
    </Wrapper>
  )
}
