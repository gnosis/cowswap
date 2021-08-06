import { createReducer } from '@reduxjs/toolkit'
import { updateReferralAddress } from './actions'

export interface AffiliateLinkState {
  referralAddress: string
}

export const initialState: AffiliateLinkState = {
  referralAddress: '',
}

export default createReducer(initialState, (builder) =>
  builder.addCase(updateReferralAddress, (state, action) => {
    state.referralAddress = action.payload.referralAddress
  })
)
