import { createAction } from '@reduxjs/toolkit'
// import { DEFAULT_NETWORK_FOR_LISTS } from '@src/custom/constants/lists'
import { ChainId } from '@uniswap/sdk'

// fired once when the app reloads but before the app renders
// allows any updates to be applied to store data loaded from localStorage
export const updateVersion = createAction<{ chainId?: ChainId }>('global/updateVersion')
