import React, { ReactNode } from 'react'
import ReactMarkdown from 'react-markdown/with-html'
import { ReactMarkdownPropsBase } from 'react-markdown'
import useFetchFile from 'hooks/useFetchFile'
import { HeadingRenderer, LinkRenderer } from './renderers'
import Page, { Title, Content } from 'components/Page'
import styled from 'styled-components'
// import ScrollToTop from '../ScrollToTop'

interface MarkdownParams {
  content: string
  title?: ReactNode
}

export const Wrapper = styled(Page)`
  /* List styles */
  > ul,
  ol {
    margin: 24px 0;
    padding: 12px 24px 12px 38px;
    background: #eefaff;
    border-radius: 12px;

    > li {
      /* Match 1st level list styles from G Docs */
      margin: 0 0 10px;
      list-style: decimal;

      > ul,
      > ol {
        > li {
          /* Match 2nd level list styles from G Docs */
          list-style: lower-alpha;
        }

        > h4:last-child {
          /* CSS hack to allow nested subheaders to be aligned */
          /* while keeping sequential lower roman bullets */
          margin-left: -2.4rem;
        }
      }
    }
  }
`

const CustomReactMarkdown = (props: ReactMarkdownPropsBase & { children: string }) => (
  <ReactMarkdown {...props} renderers={{ heading: HeadingRenderer, link: LinkRenderer }} allowDangerousHtml />
)

export default function Markdown({ content, title }: MarkdownParams) {
  const { error, file } = useFetchFile(content)
  return (
    <Wrapper>
      {title && <Title>{title}</Title>}
      <Content>
        {file && <CustomReactMarkdown>{file}</CustomReactMarkdown>}
        {error && <CustomReactMarkdown>{error}</CustomReactMarkdown>}
      </Content>
      {/* <ScrollToTop
        styleProps={{
          bottom: '8.8%',
          right: 'calc(50% - 4.6rem)',
          background: '#9bd7c2'
        }}
      /> */}
    </Wrapper>
  )
}
