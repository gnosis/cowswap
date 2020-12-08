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
      prefillState(state, action)
      const { order, id, chainId } = action.payload

      state[chainId].pending[id] = { order, id }
    })
    .addCase(removeOrder, (state, action) => {
      prefillState(state, action)
      const { id, chainId } = action.payload
      delete state[chainId].pending[id]
      delete state[chainId].fulfilled[id]
    })
    .addCase(fulfillOrder, (state, action) => {
      prefillState(state, action)
      const { id, chainId, fulfillmentTime } = action.payload

      const orderObject = state[chainId].pending[id]

      if (orderObject) {
        delete state[chainId].pending[id]

        orderObject.order.status = OrderStatus.FULFILLED
        orderObject.order.fulfillmentTime = fulfillmentTime

        state[chainId].fulfilled[id] = orderObject
      }
    })
    .addCase(clearOrders, (state, action) => {
      const { chainId } = action.payload

      state[chainId] = {
        pending: {},
        fulfilled: {}
      }
    })
)
