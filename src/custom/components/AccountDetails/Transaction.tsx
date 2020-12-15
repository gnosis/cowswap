import React from 'react'
import { CheckCircle, Triangle } from 'react-feather'

import { useActiveWeb3React } from 'hooks'
import { getEtherscanLink } from 'utils'
import { useAllTransactions } from 'state/transactions/hooks'
import { RowFixed } from 'components/Row'
import Loader from 'components/Loader'
import { useAllOrders } from 'custom/state/orders/hooks'
import { TransactionDetails } from 'state/transactions/reducer'
import { Order, OrderStatus } from 'custom/state/orders/actions'
import { TransactionWrapper, TransactionState, TransactionStatusText, IconWrapper } from './TransactionMod'
import Pill from '../Pill'

function determinePillColour(success: boolean, type: 'order' | 'transaction') {
  const isPendingOrder = !success && type === 'order',
    isFulfilledOrder = success && type === 'order',
    isPendingTx = !success && type === 'transaction',
    isFulfilledTx = success && type === 'transaction'

  if (isPendingOrder) return '#8958FF'
  else if (isFulfilledOrder) return '#27AE60'
  else if (isPendingTx) return '#ff58e8'
  else if (isFulfilledTx) return '27AE60'
  else return 'transparent'
}

export default function Transaction({ hash }: { hash: string }) {
  const { chainId } = useActiveWeb3React()
  const allTransactions = useAllTransactions()
  const allOrders = useAllOrders({ chainId })

  const tx = allTransactions?.[hash]
  const order = allOrders?.[hash]?.order

  if ((!tx && !order) || !chainId) return null

  let activity: TransactionDetails | Order, summary, pending, success, type: 'order' | 'transaction'
  if (!tx && order) {
    activity = order
    summary = activity?.summary
    pending = activity?.status === OrderStatus.PENDING
    success = !pending && activity && activity?.status === OrderStatus.FULFILLED
    type = 'order'
  } else {
    activity = tx
    summary = tx?.summary
    pending = !tx?.receipt
    success = !pending && tx && (tx.receipt?.status === 1 || typeof tx.receipt?.status === 'undefined')
    type = 'transaction'
  }

  return (
    <TransactionWrapper>
      <TransactionState href={getEtherscanLink(chainId, hash, 'transaction')} pending={pending} success={success}>
        <RowFixed>
          {activity && (
            <Pill color="#fff" bgColor={determinePillColour(success, type)}>
              {type}
            </Pill>
          )}
          <TransactionStatusText>{summary ?? hash} ↗</TransactionStatusText>
        </RowFixed>
        <IconWrapper pending={pending} success={success}>
          {pending ? <Loader /> : success ? <CheckCircle size="16" /> : <Triangle size="16" />}
        </IconWrapper>
      </TransactionState>
    </TransactionWrapper>
  )
}
