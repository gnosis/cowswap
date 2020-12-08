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
  validTo: number // unix timestamp, seconds, use new Date(validTo * 1000)
  appData: number // arbitrary identifier sent along with the order
  tip: string // in atoms
  orderType: OrderKind
  partiallyFillable: boolean
  signature: string // 65 bytes encoded as hex without `0x` prefix. v + r + s from the spec
}

export enum OrderStatus {
  PENDING,
  FULFILLED
}

// used internally by dapp
export interface Order extends OrderCreation {
  id: OrderID // it is special :)
  owner: string // address
  status: OrderStatus
  fulfillmentTime?: string
  creationTime: string
}

// gotten from querying /api/v1/orders
export interface OrderFromApi extends OrderCreation {
  creationTime: string // Creation time of the order. Encoded as ISO 8601 UTC
  owner: string // address
}

/**
 * Unique identifier for the order, calculated by keccak256(orderDigest, ownerAddress, validTo),
   where orderDigest = keccak256(orderStruct). bytes32.
 */
export type OrderID = string

export const addPendingOrder = createAction<{ id: OrderID; chainId: ChainId; order: Order }>('order/addPendingOrder')
export const removeOrder = createAction<{ id: OrderID; chainId: ChainId }>('order/removeOrder')
//                                                                        fulfillmentTime from event timestamp
export const fulfillOrder = createAction<{ id: OrderID; chainId: ChainId; fulfillmentTime: string }>(
  'order/fulfillOrder'
)
export const clearOrders = createAction<{ chainId: ChainId }>('order/clearOrders')
