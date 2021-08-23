import { AnyAction, createReducer } from '@reduxjs/toolkit'
import transactionsReducer, { initialState, TransactionState } from 'state/transactions/reducer'
import { cancelTransaction } from 'state/enhancedTransactions/actions'

export const reducer = createReducer(initialState, (builder) =>
  builder.addCase(cancelTransaction, (transactions, { payload: { chainId, hash } }) => {
    if (!transactions[chainId]?.[hash]) {
      console.error('Attempted to cancel an unknown transaction.')
      return
    }
    const allTxs = transactions[chainId] ?? {}
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { [hash]: omit, ...txs } = allTxs

    transactions[chainId] = txs
  })
)

export default (state: TransactionState | undefined, action: AnyAction) => {
  const currentState = transactionsReducer(state, action)

  return reducer(currentState, action)
}
