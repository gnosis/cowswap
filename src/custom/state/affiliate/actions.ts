import { createAction } from '@reduxjs/toolkit'

export const updateReferralAddress = createAction<{ referralAddress: string }>('affiliate/updateReferralAddress')
