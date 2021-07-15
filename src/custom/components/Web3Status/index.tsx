import React, { useMemo, useState } from 'react'
import styled from 'styled-components'
import { Web3StatusInner, Web3StatusConnected } from './Web3StatusMod'
import { AbstractConnector } from '@web3-react/abstract-connector'
import { getStatusIcon } from 'components/AccountDetails'
import useRecentActivity, { TransactionAndOrder } from 'hooks/useRecentActivity'
import { useWalletInfo } from 'hooks/useWalletInfo'
import { OrderStatus } from 'state/orders/actions'
import OrdersPanel from 'components/OrdersPanel'

const Wrapper = styled.div`
  color: ${({ theme }) => theme.wallet?.color};

  ${Web3StatusConnected} {
    color: ${({ theme }) => theme.wallet?.color};
    background: ${({ theme }) => theme.wallet?.background};

    > div > svg > path {
      stroke: ${({ theme }) => theme.black};
    }
  }
`

const isPending = (data: TransactionAndOrder) => data.status === OrderStatus.PENDING
const isConfirmed = (data: TransactionAndOrder) =>
  data.status === OrderStatus.FULFILLED || data.status === OrderStatus.EXPIRED || data.status === OrderStatus.CANCELLED

function StatusIcon({ connector }: { connector: AbstractConnector }): JSX.Element | null {
  const walletInfo = useWalletInfo()
  return getStatusIcon(connector, walletInfo)
}

export default function Web3Status() {
  const walletInfo = useWalletInfo()

  // Returns all RECENT (last day) transaction and orders in 2 arrays: pending and confirmed
  const allRecentActivity = useRecentActivity()

  const [ordersPanelOpen, setOrdersPanelOpen] = useState<boolean>(false)

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
  if (!activeNetwork && !active) {
    return null
  }

  return (
    <Wrapper onClick={() => setOrdersPanelOpen(true)}>
      <Web3StatusInner pendingCount={pendingActivity.length} StatusIconComponent={StatusIcon} />
      <OrdersPanel
        ENSName={ensName}
        pendingTransactions={pendingActivity}
        confirmedTransactions={confirmedActivity}
        ordersPanelOpen={ordersPanelOpen}
        setOrdersPanelOpen={setOrdersPanelOpen}
      />
    </Wrapper>
  )
}
