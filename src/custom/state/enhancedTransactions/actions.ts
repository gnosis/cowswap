import { createAction } from '@reduxjs/toolkit'

export const cancelTransaction = createAction<{
  chainId: number
  hash: string
}>('transactions/cancelTransaction')
