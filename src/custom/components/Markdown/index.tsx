import React, { ReactNode } from 'react'
import ReactMarkdown from 'react-markdown/with-html'
import useFetchFile from 'hooks/useFetchFile'
import { Title, Content, PageWrapper } from 'components/Markdown/markdown.styled'

interface MarkdownParams {
  content: string
  title: ReactNode
}

export default function Markdown({ content, title }: MarkdownParams) {
  const { error, file } = useFetchFile(content)
  return (
    <PageWrapper>
      <Title>{title}</Title>
      <Content>
        <ReactMarkdown>{error ? error : file}</ReactMarkdown>
      </Content>
    </PageWrapper>
  )
}
