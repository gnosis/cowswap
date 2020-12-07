import { createReducer } from '@reduxjs/toolkit'
import { updateFee, clearFee } from './actions'

export interface FeeInformation {
  expirationDate: string
  minimalFee: string
  feeRatio: number
}

interface FeeInformationObject {
  token: string // token address
  fee: FeeInformation
}

// {token address => FeeInformationObject} mapping
type FeesMap = Record<string, FeeInformationObject>

export interface FeeInformationState {
  readonly feesMap: Partial<FeesMap>
}

const initialState: FeeInformationState = {
  feesMap: {}
}

export default createReducer(initialState, builder =>
  builder
    .addCase(updateFee, (state, action) => {
      const { token, fee } = action.payload
      state.feesMap[token] = { fee, token }
    })
    .addCase(clearFee, (state, action) => {
      const { token } = action.payload
      delete state.feesMap[token]
    })
)
