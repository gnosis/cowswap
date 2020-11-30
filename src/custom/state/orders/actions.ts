import { createAction } from '@reduxjs/toolkit'

const enum OrderKind {
  SELL,
  BUY
}
// serializable, so no BigNumbers
export interface OrderCreation {
  sellToken: string // address
  buyToken: string // address
  sellAmount: string // in atoms
  buyAmount: string // in atoms
  validTo: number // unix timestamp
  appData: number // arbitrary identifier sent along with the order
  tip: string // in atoms
  orderType: OrderKind
  partiallyFillable: boolean
  signature: string // 5 bytes encoded as hex without `0x` prefix. v + r + s from the spec
}

/**
 * Unique identifier for the order, calculated by keccak256(orderDigest, ownerAddress, validTo),
   where orderDigest = keccak256(orderStruct). bytes32.
 */
export type UUID = string

export const addOrder = createAction<{ id: UUID; order: OrderCreation }>('operator/updateTip')
export const removeOrder = createAction<{ id: UUID }>('operator/clearTip')
