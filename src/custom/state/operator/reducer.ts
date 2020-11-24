import { createReducer } from '@reduxjs/toolkit'
import { updateTip, clearTip, SerializedToken, Tip } from './actions'

type TipsMap = Record<SerializedToken['address'], { token: SerializedToken; tip: Tip }>

export interface OperatorState {
  readonly tipsMap: Partial<TipsMap>
}

const initialState: OperatorState = {
  tipsMap: {}
}

export default createReducer(initialState, builder =>
  builder
    .addCase(updateTip, (state, action) => {
      const { token, tip } = action.payload
      state.tipsMap[token.address] = { tip, token }
    })
    .addCase(clearTip, (state, action) => {
      const { token } = action.payload
      delete state.tipsMap[token.address]
    })
)
