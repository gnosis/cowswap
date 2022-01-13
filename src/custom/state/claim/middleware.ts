import { Middleware, isAnyOf } from '@reduxjs/toolkit'
import { AppState } from 'state'
import { finalizeTransaction } from '../enhancedTransactions/actions'
import { setClaimStatus, ClaimStatus } from './actions'

const isFinalizeTransaction = isAnyOf(finalizeTransaction)

// On each Pending, Expired, Fulfilled order action a corresponding sound is dispatched
export const claimMinedMiddleware: Middleware<Record<string, unknown>, AppState> = (store) => (next) => (action) => {
  const result = next(action)

  if (isFinalizeTransaction(action)) {
    const { chainId, hash } = action.payload
    const transaction = store.getState().transactions[chainId][hash]

    if (transaction.claim) {
      console.log('[stat:claim:middleware] Claim transaction finalized', transaction.hash, transaction.claim)
      store.dispatch(setClaimStatus(ClaimStatus.CONFIRMED))
    }
  }

  return result
}
