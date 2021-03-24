import React from 'react'
import useMarkdown from '../../hooks/useMarkdown'
import { Title, Content, AppBodyMod } from './About.styled'
import markdownContent from './about.md'
import ReactMarkdown from 'react-markdown'

export default function About() {
  const content = useMarkdown(markdownContent)

  return (
    <AppBodyMod>
      <Title>About</Title>
      <Content>{content.length > 0 && <ReactMarkdown>{content}</ReactMarkdown>}</Content>
    </AppBodyMod>
  )
}
