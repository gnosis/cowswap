import { createAction } from '@reduxjs/toolkit'

export const closeAnnouncementWarning = createAction<{ contentHash: number }>('app/toggleURLWarning')
