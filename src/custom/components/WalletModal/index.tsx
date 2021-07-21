import React from 'react'
import Modal from '@src/components/Modal'
import styled from 'styled-components'
import WalletModalMod, { WalletModalProps } from './WalletModalMod'
import { ExternalLink } from 'theme'
import { Trans } from '@lingui/macro'
export * from '@src/components/WalletModal'

export const GpModal = styled(Modal)`
  > [data-reach-dialog-content] {
    background-color: ${({ theme }) => theme.bg1};
  }
`

const TermsWrapper = styled.div`
  color: ${({ theme }) => theme.text1};
`

export function CustomTerms() {
  return (
    <TermsWrapper>
      <Trans>
        By connecting a wallet, you agree to GnosisDAO&apos;s{' '}
        <ExternalLink href="#/terms-and-conditions">Terms &amp; Conditions</ExternalLink> and acknowledge that you have
        read, understood, and agree to them.{' '}
      </Trans>
    </TermsWrapper>
  )
}

export default function WalletModal(props: Omit<WalletModalProps, 'Modal'>) {
  return <WalletModalMod {...props} Modal={GpModal} />
}
