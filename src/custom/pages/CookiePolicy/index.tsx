import React from 'react'
import content from './CookiePolicy.md'
import MarkdownPage from 'components/MarkdownPage'
import { GdocsListStyle } from 'components/Page'
import styled from 'styled-components'

const Wrapper = styled(MarkdownPage)`
  ${GdocsListStyle}
`

export default function CookiePolicy() {
  return <Wrapper content={content} />
}
