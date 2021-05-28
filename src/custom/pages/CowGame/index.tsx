import React from 'react'
import Page, { Title, Content } from 'components/Page'
import styled from 'styled-components'
import { CowGame } from '@gnosis.pm/cow-runner-game'

const Wrapper = styled(Page)``

export default function CowGamePage() {
  return (
    <Wrapper>
      <Title>
        Run{' '}
        <span role="img" aria-label="cow-icon">
          🐮
        </span>{' '}
        Run!
      </Title>
      <p>
        ...and try not getting{' '}
        <span role="img" aria-label="sandwich-icon">
          🥪
        </span>
        . MEV it&apos;s being lethal these days.
      </p>

      <Content>
        <CowGame />
      </Content>
    </Wrapper>
  )
}
