import { createReducer } from '@reduxjs/toolkit'
import { ChainId } from '@uniswap/sdk'
import { addOrder, removeOrder, Order, OrderID, clearOrders } from './actions'

export interface OrderObject {
  id: OrderID
  order: Order
}

// {order uuid => OrderObject} mapping
type OrdersMap = Record<OrderID, OrderObject>

export type OrdersState = {
  readonly [chainId in ChainId]?: Partial<OrdersMap>
}

const initialState: OrdersState = {}

export default createReducer(initialState, builder =>
  builder
    .addCase(addOrder, (state, action) => {
      const { order, id, chainId } = action.payload

      const orderMap = state[chainId] ?? {}

      orderMap[id] = { order, id }
      state[chainId] = orderMap
    })
    .addCase(removeOrder, (state, action) => {
      const { id, chainId } = action.payload

      const orderMap = state[chainId] ?? {}

      delete orderMap[id]
    })
    .addCase(clearOrders, (state, action) => {
      const { chainId } = action.payload

      state[chainId] = {}
    })
)
