import { createAction } from '@reduxjs/toolkit'

export const closeAnnouncement = createAction<{ contentHash: number }>('userMod/closeAnnouncement')
