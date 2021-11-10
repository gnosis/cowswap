import { createAction } from '@reduxjs/toolkit'

export const updateReferralAddress = createAction<{
  value: string
  isValid: boolean
} | null>('affiliate/updateReferralAddress')
export const updateAppDataHash = createAction<string>('affiliate/updateAppDataHash')

export const dismissNotification = createAction<{ id: string; dismiss: boolean }>('affiliate/dismissNotification')
