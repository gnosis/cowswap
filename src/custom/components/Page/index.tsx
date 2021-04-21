import React, { PropsWithChildren } from 'react'

import styled from 'styled-components'
import AppBody from 'pages/AppBody'
import { WithClassName } from 'types'

export const PageWrapper = styled(AppBody)`
  padding: 0 24px 24px;
  max-width: ${({ theme }) => theme.appBody.maxWidth.content};
  min-height: 500px;
`

export const Title = styled.h1`
  font-size: 32px;
  margin: 24px 0 16px;
`

export const Content = styled.div`
  font-size: 15px;
  margin: 0 0 28px;
  display: block;

  > h2 {
    font-size: 24px;
    margin: 24px 0 16px;
  }

  > h2 > b {
    color: ${({ theme }) => theme.primary1};
  }

  > h3 {
    font-size: 18px;
    margin: 24px 0;
  }

  > h3::before {
    content: '';
    display: block;
    border-top: 1px solid ${({ theme }) => theme.border};
    margin: 34px 0;
    opacity: 0.2;
  }

  /* underlined subheader */
  > h4 {
    text-decoration: underline;
    font-weight: normal;
    // margin: 0;
  }

  > p {
    line-height: 1.5;
  }

  > p > img {
    width: 100%;
    height: auto;
    margin: 24px auto;
  }

  #table-container {
    overflow-x: scroll;

    > table {
      min-width: 800px;

      thead, tr:nth-child(even) {
          background: lightgrey;
        }
      }

      th,
      td {
        min-width: 8.5rem;
        text-align: left;
        padding: 0.5rem 0.4rem;
      }
    }
  }
`

export type PageProps = PropsWithChildren<WithClassName>

export default function Page(props?: PageProps) {
  return <PageWrapper className={props?.className}>{props?.children}</PageWrapper>
}
