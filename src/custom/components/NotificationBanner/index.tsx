import React, { useState } from 'react'
import styled from 'styled-components/macro'
import { Colors } from 'theme/styled'
import { X } from 'react-feather'

export interface BannerProps {
  children: React.ReactNode | string
  level: 'info' | 'warning' | 'error'
  visible: boolean
}

const Banner = styled.div<{ isActive: any; level: 'info' | 'warning' | 'error' }>`
  width: 100%;
  height: 40px;
  padding: 6px 6px;
  background-color: ${({ theme, level }) => theme[level]};
  color: ${({ theme, level }) => theme[`${level}Text` as keyof Colors]};
  font-size: 16px;
  justify-content: space-between;
  align-items: center;
  display: ${({ isActive }) => (isActive ? 'flex' : 'none')};
`

const StyledClose = styled(X)`
  :hover {
    cursor: pointer;
  }
`
const BannerContainer = styled.div`
  display: flex;
  flex: 1;
  justify-content: center;
`
export default function NotificationBanner(props: BannerProps) {
  const [isActive, setIsActive] = useState(props.visible)
  return (
    <Banner isActive={isActive} {...props}>
      <BannerContainer>{props.children}</BannerContainer>
      <StyledClose size={16} onClick={() => setIsActive(false)} />
    </Banner>
  )
}
