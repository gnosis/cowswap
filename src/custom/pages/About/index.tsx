import React from 'react'
import AppBody from 'pages/AppBody'
import styled from 'styled-components'

const Title = styled.h1`
  font-size: 24px;
`

export default function About() {
  return (
    <AppBody>
      <Title>About</Title>
    </AppBody>
  )
}
