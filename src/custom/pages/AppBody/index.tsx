import React from 'react'
<<<<<<< HEAD
import { BodyWrapper as BodyWrapperMod } from './AppBodyMod'
=======
import { BodyWrapper as BodyWrapperMod } from '@src/pages/AppBody'
>>>>>>> bbf5f76e51232b5562823e9f243caf5652d1a258
import styled from 'styled-components'
import Version from 'components/Version'

export const BodyWrapper = styled(BodyWrapperMod)`
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
