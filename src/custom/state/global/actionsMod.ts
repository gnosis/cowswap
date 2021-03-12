import { createAction } from '@reduxjs/toolkit'
import { ChainId } from '@uniswap/sdk'

// fired once when the app reloads but before the app renders
// allows any updates to be applied to store data loaded from localStorage
// export const updateVersion = createAction('global/updateVersion')
export const updateVersion = createAction<{ chainId?: ChainId }>('global/updateVersion')
