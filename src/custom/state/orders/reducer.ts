import { createReducer } from '@reduxjs/toolkit'
import { ChainId } from '@uniswap/sdk'
import { addOrder, removeOrder, Order, OrderID, clearOrders, fulfillOrder, OrderStatus } from './actions'

export interface OrderObject {
  id: OrderID
  order: Order
}

// {order uuid => OrderObject} mapping
type OrdersMap = Record<OrderID, OrderObject>
export type PartialOrdersMap = Partial<OrdersMap>

export type OrdersState = {
  readonly [chainId in ChainId]?: {
    pending: PartialOrdersMap
    fulfilled: PartialOrdersMap
  }
}
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
    .addCase(fulfillOrder, (state, action) => {
      const { id, chainId, fulfillmentTime } = action.payload

      const orderMap = state[chainId] ?? {}

      const orderObject = orderMap[id]

      if (orderObject) {
        orderObject.order.status = OrderStatus.FULFILLED
        orderObject.order.fulfillmentTime = fulfillmentTime
      }
    })
    .addCase(clearOrders, (state, action) => {
      const { chainId } = action.payload

      state[chainId] = {}
    })
)
