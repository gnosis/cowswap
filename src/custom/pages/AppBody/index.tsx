import React from 'react'
import styled from 'styled-components/macro'
import { BodyWrapper as BodyWrapperMod } from '@src/pages/AppBody'
import { transparentize } from 'polished'

export const BodyWrapper = styled(BodyWrapperMod)`
  border-radius: ${({ theme }) => theme.appBody.borderRadius};
  background: ${({ theme }) => transparentize(0.5, theme.bg1)};
  box-shadow: none;
  border: 1px solid ${({ theme }) => theme.cardBorder};
  padding: ${({ theme }) => theme.appBody.padding};
  max-width: ${({ theme }) => theme.appBody.maxWidth.normal};
`

/**
 * The styled container element that wraps the content of most pages and the tabs.
 */
export default function AppBody({ children, className }: { children: React.ReactNode; className?: string }) {
  return <BodyWrapper className={className}>{children}</BodyWrapper>
}
