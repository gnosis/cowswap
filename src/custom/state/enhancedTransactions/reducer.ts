import { AnyAction, createReducer } from '@reduxjs/toolkit'
import transactionsReducer, { initialState, TransactionState } from 'state/transactions/reducer'
import { cancelTransaction, replaceTransaction } from 'state/enhancedTransactions/actions'

export const reducer = createReducer(initialState, (builder) =>
  builder
    .addCase(cancelTransaction, (transactions, { payload: { chainId, hash } }) => {
      if (!transactions[chainId]?.[hash]) {
        console.error('Attempted to cancel an unknown transaction.')
        return
      }
      const allTxs = transactions[chainId] ?? {}
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [hash]: omit, ...txs } = allTxs

      transactions[chainId] = txs
    })
    .addCase(replaceTransaction, (transactions, { payload: { chainId, oldHash, newHash } }) => {
      if (!transactions[chainId]?.[oldHash]) {
        throw Error('Attempted to replace an unknown transaction.')
      }
      const txs = transactions[chainId] ?? {}
      const { [oldHash]: replacedTx, ...rest } = txs
      rest[newHash] = { ...replacedTx, hash: newHash, addedTime: new Date().getTime() }

      transactions[chainId] = rest
    })
)

export default (state: TransactionState | undefined, action: AnyAction) => {
  const currentState = transactionsReducer(state, action)

  return reducer(currentState, action)
}
