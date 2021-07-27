import { createAction } from '@reduxjs/toolkit'

export const updateAffiliateLink = createAction<{ affiliateLink: string }>('affiliate/updateAffiliateLink')
