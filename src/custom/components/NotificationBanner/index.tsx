import { useCallback, useEffect, useState } from 'react'
import styled from 'styled-components/macro'
import { Colors } from 'theme/styled'
import { X } from 'react-feather'
import { MEDIA_WIDTHS } from '@src/theme'
import { useLocalStorage } from 'hooks/useLocalStorage'

type Level = 'info' | 'warning' | 'error'

export interface BannerProps {
  children: React.ReactNode
  level: Level
  isVisible: boolean
  changeOnProp: any
}

const Banner = styled.div<Pick<BannerProps, 'isVisible' | 'level'>>`
  width: 100%;
  min-height: 40px;
  padding: 6px 6px;
  background-color: ${({ theme, level }) => theme[level]};
  color: ${({ theme, level }) => theme[`${level}Text` as keyof Colors]};
  font-size: 16px;
  justify-content: space-between;
  align-items: center;
  display: ${({ isVisible }) => (isVisible ? 'flex' : 'none')};
  z-index: 1;

  @media screen and (max-width: ${MEDIA_WIDTHS.upToSmall}px) {
    font-size: 12px;
  }
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
  const [isActive, setIsActive] = useState(props.isVisible)
  const [noteBannerVisibility, setNoteBannerVisibility] = useLocalStorage('noteBannerVisibility', true)
  const handleHideBanner = useCallback(() => {
    setNoteBannerVisibility(false)
  }, [setNoteBannerVisibility])
  const noteHandleClose = () => {
    setIsActive(false)
    handleHideBanner()
  }

  useEffect(() => {
    setNoteBannerVisibility(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.changeOnProp])

  return (
    <Banner {...props} isVisible={isActive} style={{ display: noteBannerVisibility ? 'flex' : 'none' }}>
      <BannerContainer>{props.children}</BannerContainer>
      <StyledClose size={16} onClick={() => noteHandleClose()} />
    </Banner>
  )
}
