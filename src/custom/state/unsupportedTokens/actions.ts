import { createAction } from '@reduxjs/toolkit'
import { ChainId } from '@uniswap/sdk'

export interface UnsupportedTokenParams {
  address: string
  chainId: ChainId
}

// add and remove
export const addUnsupportedToken = createAction<UnsupportedTokenParams>('unsupportedTokens/addToken')
export const removeUnsupportedToken = createAction<UnsupportedTokenParams>('unsupportedTokens/removeToken')
