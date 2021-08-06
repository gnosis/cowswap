import { createReducer } from '@reduxjs/toolkit'
import { closeAnnouncement } from './actions'

export interface UserModState {
  announcementVisible: {
    [contentHash: string]: boolean
  }
}

export const initialState: UserModState = {
  announcementVisible: {},
}

export default createReducer(initialState, (builder) =>
  builder
    /**
     * Close announcement
     */
    .addCase(closeAnnouncement, (state, action) => {
      const { contentHash } = action.payload
      state.announcementVisible[contentHash] = false
    })
)
