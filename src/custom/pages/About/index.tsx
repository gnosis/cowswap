import React from 'react'
import content from 'pages/About/About.md'
import Markdown from 'components/Markdown'

export default function About() {
  return <Markdown content={content} title="About" />
}
