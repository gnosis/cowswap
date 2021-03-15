import React from 'react'
import styled from 'styled-components'
import Version from 'components/Version'

export const BodyWrapper = styled.div`
  position: relative;
  max-width: ${({ theme }) => theme.appBody.maxWidth};
  width: 100%;
  background: ${({ theme }) => theme.bg1};
  box-shadow: ${({ theme }) => theme.appBody.boxShadow};
  border-radius: ${({ theme }) => theme.appBody.borderRadius};
  border: ${({ theme }) => theme.appBody.border};
  padding: ${({ theme }) => theme.appBody.padding};
`

/**
 * The styled container element that wraps the content of most pages and the tabs.
 */
export default function AppBody({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <BodyWrapper className={className}>
      {children}
      <Version />
    </BodyWrapper>
  )
}
