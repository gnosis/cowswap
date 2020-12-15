import React from 'react'
import { useWeb3React } from '@web3-react/core'
import useENSName from 'hooks/useENSName'
import { NetworkContextName } from 'constants/index'

import WalletModal from 'components/WalletModal'
import { Web3StatusInner } from './Web3StatusMod'
import useAllTransactionsAndOrders from 'custom/hooks/useAllTransactionsAndOrders'

// TODO: remove once waterfall PRs are done (useful for testing this
import { useAddOrdersOnMount } from 'custom/state/orders/mock'

export default function Web3Status() {
  // TODO: remove once waterfall PRs are done (useful for testing this)
  useAddOrdersOnMount()
  const { active, account } = useWeb3React()
  const contextNetwork = useWeb3React(NetworkContextName)

  const { ENSName } = useENSName(account ?? undefined)

  const { pendingTransactions, confirmedTransactions } = useAllTransactionsAndOrders()

  if (!contextNetwork.active && !active) {
    return null
  }

  return (
    <>
      <Web3StatusInner pendingCount={pendingTransactions.concat(confirmedTransactions).length} />
      <WalletModal
        ENSName={ENSName ?? undefined}
        pendingTransactions={pendingTransactions}
        confirmedTransactions={confirmedTransactions}
      />
    </>
  )
}
