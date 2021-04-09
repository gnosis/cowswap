import React, { ReactNode } from 'react'
import ReactMarkdown from 'react-markdown/with-html'
import { ReactMarkdownPropsBase } from 'react-markdown'
import useFetchFile from 'hooks/useFetchFile'
import { Title, Content, PageWrapper } from 'components/Markdown/markdown.styled'
import { HeadingRenderer, LinkRenderer } from './renderers'

interface MarkdownParams {
  content: string
  title?: ReactNode
}

const CustomReactMarkdown = (props: ReactMarkdownPropsBase & { children: string }) => (
  <ReactMarkdown {...props} renderers={{ heading: HeadingRenderer, link: LinkRenderer }} allowDangerousHtml>
    {props.children}
  </ReactMarkdown>
)

export default function Markdown({ content, title }: MarkdownParams) {
  const { error, file } = useFetchFile(content)
  return (
    <PageWrapper>
      {title && <Title>{title}</Title>}
      <Content>
        {file && <CustomReactMarkdown>{file}</CustomReactMarkdown>}
        {error && <CustomReactMarkdown>{error}</CustomReactMarkdown>}
      </Content>
    </PageWrapper>
  )
}
