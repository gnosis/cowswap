import { createAction } from '@reduxjs/toolkit'
import { ChainId } from '@uniswap/sdk'

export type Tip = number

export enum OrderType {
  buy = 'buy',
  sell = 'sell'
}

/**
 * Required parameters to send a swap order using a meta-transaction
 */
export interface AddPendingOrder {
  order: OrderCreation
  summary?: string
}

export interface OrderCreation {
  chainId: ChainId // Not in the API!
  sellToken: string
  buyToken: string
  sellAmount: string
  buyAmount: string
  validTo: string // deadline
  appData: undefined // TODO: Add appId
  tip: string // TODO: Should be called Fee
  orderType: OrderType // buy, sell
  partiallyFillable: false
  signature: string // 65 bytes encoded as hex without `0x`
}

export interface OrderMetaData {
  uid: string
  creationTime: string
  owner: string
}

export type Order = OrderCreation & OrderMetaData

export const addPendingOrder = createAction<AddPendingOrder>('operator/addPendingOrder')
export const updateExecutedOrder = createAction<{ uuid: string }>('operator/updateExecutedOrder')
export const updateExpiredOrder = createAction<{ uuid: string }>('operator/updateExpiredOrder')
export const updateTip = createAction<{ token: string; tip: Tip }>('operator/updateTip')
export const clearTip = createAction<{ token: string }>('operator/clearTip')
