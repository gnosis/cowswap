import { createReducer } from '@reduxjs/toolkit'
import {
  updateTip,
  clearTip,
  Tip,
  Order,
  addPendingOrder,
  PendingOrder,
  updateExecutedOrder,
  updateExpiredOrder
} from './actions'

export interface TipObject {
  token: string // token address
  tip: Tip
}

// {token address => TipObject} mapping
export type TipsMap = Record<string, TipObject>

export interface OperatorState {
  readonly pendingOrders: PendingOrder[]
  readonly pastOrders: Order[]
  readonly tipsMap: Partial<TipsMap>
}

const initialState: OperatorState = {
  pendingOrders: [],
  pastOrders: [],
  tipsMap: {}
}

export default createReducer(initialState, builder =>
  builder
    .addCase(addPendingOrder, (state, action) => {
      state.pendingOrders.push(action.payload)
      console.log('Add pending orders', state.pendingOrders, action)
    })
    .addCase(updateExecutedOrder, (state, action) => {
      console.log('TODO: Update executed order', state, action)
    })
    .addCase(updateExpiredOrder, (state, action) => {
      console.log('TODO: Update expired order', state, action)
    })
    .addCase(updateTip, (state, action) => {
      const { token, tip } = action.payload
      state.tipsMap[token] = { tip, token }
    })
    .addCase(clearTip, (state, action) => {
      const { token } = action.payload
      delete state.tipsMap[token]
    })
)
