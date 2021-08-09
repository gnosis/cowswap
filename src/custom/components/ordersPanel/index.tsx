import React, { useState, useRef, useMemo } from 'react'
import styled from 'styled-components/macro'
import { ReactComponent as Close } from 'assets/images/x.svg'
import { useOnClickOutside } from 'hooks/useOnClickOutside'
import AccountDetails from 'components/AccountDetails'
import useRecentActivity, { TransactionAndOrder } from 'hooks/useRecentActivity'
import { useWalletInfo } from 'hooks/useWalletInfo'
import { OrderStatus } from 'state/orders/actions'

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

const WALLET_VIEWS = {
  OPTIONS: 'options',
  OPTIONS_SECONDARY: 'options_secondary',
  ACCOUNT: 'account',
  PENDING: 'pending',
}

const isPending = (data: TransactionAndOrder) => data.status === OrderStatus.PENDING
const isConfirmed = (data: TransactionAndOrder) =>
  data.status === OrderStatus.FULFILLED || data.status === OrderStatus.EXPIRED || data.status === OrderStatus.CANCELLED

export interface OrdersPanelProps {
  ordersPanelOpen: boolean
  closeOrdersPanel: () => void
}

export default function OrdersPanel({ ordersPanelOpen, closeOrdersPanel }: OrdersPanelProps) {
  // Close sidebar if clicked/tapped outside
  const ref = useRef<HTMLDivElement | null>(null)
  useOnClickOutside(ref, ordersPanelOpen ? closeOrdersPanel : undefined)

  const walletInfo = useWalletInfo()
  const [walletView, setWalletView] = useState(WALLET_VIEWS.ACCOUNT)

  // Returns all RECENT (last day) transaction and orders in 2 arrays: pending and confirmed
  const allRecentActivity = useRecentActivity()

  const { pendingActivity, confirmedActivity } = useMemo(() => {
    // Separate the array into 2: PENDING and FULFILLED(or CONFIRMED)+EXPIRED
    const pendingActivity = allRecentActivity.filter(isPending).map((data) => data.id)
    const confirmedActivity = allRecentActivity.filter(isConfirmed).map((data) => data.id)

    return {
      pendingActivity,
      confirmedActivity,
    }
  }, [allRecentActivity])

  const { active, activeNetwork, ensName } = walletInfo
  const ENSName = ensName

  if (!activeNetwork && !active) {
    return null
  }

  console.log(walletView)

  return (
    <SideBar ref={ref} isOpen={ordersPanelOpen}>
      <CloseIcon onClick={closeOrdersPanel} />
      <Wrapper>
        <AccountDetails
          ENSName={ENSName}
          pendingTransactions={pendingActivity}
          confirmedTransactions={confirmedActivity}
          openOptions={() => setWalletView(WALLET_VIEWS.OPTIONS)}
          closeOrdersPanel={closeOrdersPanel}
        />
      </Wrapper>
    </SideBar>
  )
}

// onDismiss={() => setOrdersPanelOpen(false)}
