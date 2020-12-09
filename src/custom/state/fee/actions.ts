import { createAction } from '@reduxjs/toolkit'
import { FeeInformation } from './reducer'

export const updateFee = createAction<{ token: string; fee: FeeInformation }>('fee/updateFee')
export const clearFee = createAction<{ token: string }>('fee/clearFee')
