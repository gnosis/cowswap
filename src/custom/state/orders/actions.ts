import { createAction } from '@reduxjs/toolkit'
import { ChainId } from '@uniswap/sdk'

enum OrderKind {
  SELL,
  BUY
}

// posted to /api/v1/orders on Order creation
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

// used internally by dapp
export interface Order extends OrderCreation {
  id: OrderID // it is special :)
  owner: string // address
  status: string
  fulfillTime: string
  createTime: string
}

// gotten from querying /api/v1/orders
export interface OrderFull extends OrderCreation {
  creationTime: string // Creation time of the order. Encoded as ISO 8601 UTC
  owner: string // address
}

/**
 * Unique identifier for the order, calculated by keccak256(orderDigest, ownerAddress, validTo),
   where orderDigest = keccak256(orderStruct). bytes32.
 */
export type OrderID = string

export const addOrder = createAction<{ id: OrderID; chainId: ChainId; order: Order }>('order/updateOrder')
export const removeOrder = createAction<{ id: OrderID; chainId: ChainId }>('order/removeOrder')
export const clearOrders = createAction<{ chainId: ChainId }>('order/clearOrders')
