import React from 'react'
import HeaderMod, { UniIcon } from './HeaderMod'
import styled from 'styled-components'
import { status as appStatus } from '@src/../package.json'

export { NETWORK_LABELS } from './HeaderMod'

export const HeaderModWrapper = styled(HeaderMod)`
  border-bottom: ${({ theme }) => (theme.header?.border ? theme.header.border : `1px solid ${theme.border}`)};

  ${UniIcon} {
    display: flex;
  }
`

const AppStatusWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 8px;
  background: white;
  border: 2px solid ${({ theme }) => theme.primary1};
  color: ${({ theme }) => theme.primary1};
  margin: auto 0 -5px -5px;
  padding: 3px 6px;
  font-weight: 800;
  letter-spacing: 0.2rem;
  text-transform: uppercase;
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
  return <HeaderModWrapper statusLabel={<AppStatusWrapper>{appStatus}</AppStatusWrapper>} />
}
