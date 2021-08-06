import { createReducer } from '@reduxjs/toolkit'
import { updateAppDataHash, updateReferralAddress } from './actions'
import { METADATA_DIGEST_HEX } from 'constants/index'

export interface AffiliateState {
  referralAddress?: string
  appDataHash: string
}

export const initialState: AffiliateState = {
  appDataHash: METADATA_DIGEST_HEX,
}

export default createReducer(initialState, (builder) =>
  builder
    .addCase(updateReferralAddress, (state, action) => {
      state.referralAddress = action.payload
    })
    .addCase(updateAppDataHash, (state, action) => {
      state.appDataHash = action.payload
    })
)
