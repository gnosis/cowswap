import React from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'

import Version from '../Version'
const FOOTER_URLS = [
  { name: '© 2021 Gnosis' },
  { name: 'About', url: '/about' },
  { name: 'Cookies', url: '/cookie-policy' },
  { name: 'Privacy', url: '/privacy-policy' },
  { name: 'Terms', url: '/terms-and-conditions' }
]

const FooterVersion = styled(Version)`
  margin-right: auto;
  min-width: max-content;
`

const Wrapper = styled.div`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: center;
  justify-content: space-evenly;
  margin: auto 6rem 1rem 0;

  width: 100%;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    display: none;
  `}
`

const UrlWrapper = styled(Wrapper)`
  margin: 0;

  > * {
    font-size: small;
    text-align: center;
    margin: 0 0.5rem;
    width: 20%;

    &:not(:last-child) {
      border-right: 1px solid black;
    }
  }
`

export default function Footer() {
  return (
    <Wrapper>
      <FooterVersion />
      <UrlWrapper>
        {FOOTER_URLS.map(({ name, url }) =>
          url ? (
            <Link key={url} to={url}>
              {name}
            </Link>
          ) : (
            <span>{name}</span>
          )
        )}
      </UrlWrapper>
    </Wrapper>
  )
}
