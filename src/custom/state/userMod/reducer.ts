import { createReducer } from '@reduxjs/toolkit'
import { closeAnnouncementWarning } from './actions'

export interface UserModState {
  announcementMessageVisible: {
    [contentHash: number]: boolean
  }
}

export const initialState: UserModState = {
  announcementMessageVisible: {},
}

export default createReducer(initialState, (builder) =>
  builder.addCase(closeAnnouncementWarning, (state, action) => {
    const { contentHash } = action.payload
    state.announcementMessageVisible[contentHash] = false
  })
)
