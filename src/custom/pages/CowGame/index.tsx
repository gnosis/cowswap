import React from 'react'
import Page, { Title, Content } from 'components/Page'
import styled from 'styled-components'
import { CowGame } from '@anxolin/cow-runner-game'

const Wrapper = styled(Page)``

export default function CowGame2() {
  return (
    <Wrapper>
      <Title>Cow Game</Title>

      <Content>
        <CowGame />
      </Content>
    </Wrapper>
  )
}
