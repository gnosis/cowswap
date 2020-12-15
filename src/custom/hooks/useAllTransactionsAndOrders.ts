import { useMemo } from 'react'
import { useAllTransactions } from 'state/transactions/hooks'
import { useOrders } from 'state/orders/hooks'
import { useActiveWeb3React } from 'hooks'
import { Order, OrderStatus } from 'state/orders/actions'
import { TransactionDetails } from '@src/state/transactions/reducer'

type TransactionAndOrder =
  | (Order & { addedTime: number })
  | (TransactionDetails & {
      id: string
      status: 'pending' | 'fulfilled'
    })

/**
 * Returns whether a transaction/order happened in the last day (86400 seconds * 1000 milliseconds / second)
 * @param time to check for recency
 */
export function isRecent(time: number): boolean {
  return new Date().getTime() - time < 86_400_000
}

function isPending(data: TransactionAndOrder) {
  return data.status === OrderStatus.PENDING
}

function isFulfilled(data: TransactionAndOrder) {
  return data.status === OrderStatus.FULFILLED
}

export default function useAllTransactionsAndOrders() {
  const { chainId } = useActiveWeb3React()
  const allTransactions = useAllTransactions()
  const allNonEmptyOrders = useOrders({ chainId })

  return useMemo(() => {
    const adjustedTransactions = Object.values(allTransactions)
      .map(tx => ({ ...tx, id: tx.hash, status: tx.receipt ? 'fulfilled' : 'pending' }))
      .filter(tx => isRecent(tx.addedTime))

    const adjustedOrders = allNonEmptyOrders
      .map(order => ({ ...order, addedTime: Date.parse(order.creationTime) }))
      .filter(order => isRecent(order.addedTime))

    const sortedTransactionsAndOrders = (adjustedTransactions as TransactionAndOrder[])
      .concat(adjustedOrders)
      .sort((a, b) => {
        return b.addedTime - a.addedTime
      })

    const pendingTransactions = sortedTransactionsAndOrders.filter(isPending).map(data => data.id)
    const confirmedTransactions = sortedTransactionsAndOrders.filter(isFulfilled).map(data => data.id)

    return {
      pendingTransactions,
      confirmedTransactions
    }
  }, [allNonEmptyOrders, allTransactions])
}
