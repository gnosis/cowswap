import React from 'react'
import styled from 'styled-components'

const Wrapper = styled.button`
  position: absolute;
  bottom: 40px;
  right: 20px;
  font-size: 40pt;
`
const APPZI_KEY = 'f7591eca-72f7-4888-b15f-e7ff5fcd60cd'

declare global {
  interface Window {
    appzi?: {
      openWidget: (key: string) => void
    }
  }
}

function openWidget() {
  window.appzi?.openWidget(APPZI_KEY)
}

export default function Appzi() {
  return <Wrapper onClick={openWidget}>🐮</Wrapper>
}
