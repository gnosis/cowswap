import { createReducer } from '@reduxjs/toolkit'
import { addOrder, removeOrder, OrderCreation, UUID } from './actions'

interface OrderObject {
  id: UUID
  order: OrderCreation
}

// {order uuid => OrderObject} mapping
type OrdersMap = Record<UUID, OrderObject>

export interface OrdersState {
  readonly orderMap: Partial<OrdersMap>
}

const initialState: OrdersState = {
  orderMap: {}
}

export default createReducer(initialState, builder =>
  builder
    .addCase(addOrder, (state, action) => {
      const { order, id } = action.payload
      state.orderMap[id] = { order, id }
    })
    .addCase(removeOrder, (state, action) => {
      const { id } = action.payload
      delete state.orderMap[id]
    })
)
