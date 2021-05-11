import { ChainId } from '@uniswap/sdk'
import { createReducer } from '@reduxjs/toolkit'
import { addUnsupportedToken, removeUnsupportedToken } from './actions'
import { initializeState } from '../price/reducer'

type UnsupportedTokensList = Record<string, string>

export type UnsupportedTokensState = {
  readonly [chainId in ChainId]?: UnsupportedTokensList
}

const initialState: UnsupportedTokensState = {}

export default createReducer(initialState, builder =>
  builder
    .addCase(addUnsupportedToken, (state, action) => {
      initializeState<UnsupportedTokensState>(state, action)
      const { chainId, address } = action.payload

      if (!state[chainId][address]) {
        state[chainId][address] = address
      }
    })
    .addCase(removeUnsupportedToken, (state, action) => {
      initializeState<UnsupportedTokensState>(state, action)
      const { chainId, address } = action.payload

      delete state[chainId][address]
    })
)
