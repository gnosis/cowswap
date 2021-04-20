import React from 'react'
import content from './Faq.md'
import MarkdownPage from 'components/MarkdownPage'

export default function PrivacyPolicy() {
  return <MarkdownPage content={content} />
}
