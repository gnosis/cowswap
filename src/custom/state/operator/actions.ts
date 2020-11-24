import { createAction } from '@reduxjs/toolkit'

// modeled after state/user/actions
export interface SerializedToken {
  chainId: number
  address: string
  decimals: number
  symbol?: string
  name?: string
}

export interface Tip {
  value: string
  expiration: string // serialazable date or time
}

export const updateTip = createAction<{ token: SerializedToken; tip: Tip }>('operator/updateTip')
export const clearTip = createAction<{ token: SerializedToken }>('operator/clearTip')
