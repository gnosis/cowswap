import { createAction } from '@reduxjs/toolkit'
import { WithChainId } from '../lists/actions'

export type UpdateGasPrices = { lastUpdate: string; price: string } & WithChainId

export const updateGasPrices = createAction<UpdateGasPrices>('gas/updateGasPrices')
