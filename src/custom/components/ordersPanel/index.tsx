import React, { useRef } from 'react'
import styled from 'styled-components/macro'
import { ReactComponent as Close } from 'assets/images/x.svg'
import { useOnClickOutside } from 'hooks/useOnClickOutside'

const SideBar = styled.div<{ isOpen: boolean }>`
  display: ${({ isOpen }) => (isOpen ? 'flex' : 'none')};
  position: fixed;
  top: 0;
  right: 0;
  width: 500px;
  height: 100%;
  z-index: 99999;
  padding: 0;
  background: ${({ theme }) => theme.bg1};
  box-shadow: 0 0 100vh 100vw rgb(0 0 0 / 25%);
  cursor: default;

  ${({ theme }) => theme.mediaWidth.upToMedium`    
    width: 100%;
    height: 100%;
  `};
`

const CloseIcon = styled(Close)`
  position: absolute;
  right: 1rem;
  top: 14px;

  &:hover {
    cursor: pointer;
    opacity: 0.6;
  }

  path {
    stroke: ${({ theme }) => theme.text4};
  }
`

const Wrapper = styled.div`
  display: flex;
  flex-flow: column wrap;
  margin: 0;
  padding: 0;
  width: 100%;
  overflow-y: auto;
`

export interface OrdersPanelProps {
  ordersPanelOpen: boolean
  closeOrdersPanel: () => void
}

export default function OrdersPanel({ ordersPanelOpen, closeOrdersPanel }: OrdersPanelProps) {
  // Close sidebar if clicked/tapped outside
  const ref = useRef<HTMLDivElement | null>(null)
  useOnClickOutside(ref, ordersPanelOpen ? closeOrdersPanel : undefined)

  return (
    <SideBar ref={ref} isOpen={ordersPanelOpen}>
      <CloseIcon onClick={closeOrdersPanel} />
      <Wrapper>- getModalContent() -</Wrapper>
    </SideBar>
  )
}

// onDismiss={() => setOrdersPanelOpen(false)}
