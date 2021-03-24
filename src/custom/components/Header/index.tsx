import React from 'react'
import HeaderMod, { UniIcon, NetworkCard, Title, HeaderLinks } from './HeaderMod'
import styled from 'styled-components'
import { status as appStatus } from '@src/../package.json'

export { NETWORK_LABELS } from './HeaderMod'

export interface LinkType {
  id: number
  title: string
  path: string
}

const headerLinks: LinkType[] = [
  { id: 0, title: 'Swap', path: '/swap' },
  { id: 1, title: 'About', path: '/about' }
]

export const HeaderModWrapper = styled(HeaderMod)`
  border-bottom: ${({ theme }) => theme.header.border};

  ${UniIcon} {
    display: flex;
    margin: 0 16px 0 0;
    position: relative;

    &::after {
      content: '${appStatus}';
      display: block;
      font-size: 10px;
      font-weight: bold;
      position: absolute;
      right: 12px;
      top: 2px;
    }
  }

  ${Title} {
    margin: 0;
    text-decoration: none;
    color: ${({ theme }) => theme.text1};
  }

  ${HeaderLinks} {
    margin: 5px 0 0 0;
  }

  ${NetworkCard} {
    background: ${({ theme }) => theme.networkCard.background};
    color: ${({ theme }) => theme.networkCard.text};
  }
`

export const LogoImage = styled.img.attrs(props => ({
  src: props.theme.logo.src,
  alt: props.theme.logo.alt,
  width: props.theme.logo.width,
  height: props.theme.logo.height
}))`
  object-fit: contain;
`

export default function Header() {
  return <HeaderModWrapper headerLinks={headerLinks} />
}
