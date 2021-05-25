import React from 'react'
import Modal from 'components/Modal'

import { CowGame } from '@anxolin/cow-runner-game'
import { AutoColumn } from 'components/Column'
import styled from 'styled-components'

interface StakingModalProps {
  isOpen: boolean
  onDismiss: () => void
}

const ContentWrapper = styled(AutoColumn)`
  width: 1000px;
  padding: 1rem;
`

export default function CowGameModal({ isOpen, onDismiss }: StakingModalProps) {
  return (
    <Modal isOpen={isOpen} onDismiss={onDismiss} maxHeight={90}>
      <ContentWrapper gap="lg">
        <CowGame />
      </ContentWrapper>
    </Modal>
  )
}
