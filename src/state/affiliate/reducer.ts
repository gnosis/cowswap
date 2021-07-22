import { createReducer } from '@reduxjs/toolkit'
import { updateAffiliateLink } from './actions'

export interface AffiliateLinkState {
  affiliateLink: string
}

export const initialState: AffiliateLinkState = {
  affiliateLink: '',
}

export default createReducer(initialState, (builder) =>
  builder.addCase(updateAffiliateLink, (state, action) => {
    console.log('Triggered Updated Link')
    state.affiliateLink = action.payload.affiliateLink
  })
)
