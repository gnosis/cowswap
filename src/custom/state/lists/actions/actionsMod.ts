import { ActionCreatorWithPayload, createAction } from '@reduxjs/toolkit'
import { ChainId } from '@uniswap/sdk'
import { TokenList, Version } from '@uniswap/token-lists'

interface WithChainIdAndUrl {
  chainId?: ChainId
  url: string
}

interface PendingFetchTokenList extends WithChainIdAndUrl {
  requestId: string
}

interface FulfilledFetchTokenList extends PendingFetchTokenList {
  tokenList: TokenList
}

interface RejectedFetchTokenList extends PendingFetchTokenList {
  errorMessage: string
}

export const setDefaultChainId = <T extends WithChainIdAndUrl>(payload: T) => {
  return {
    ...payload,
    chainId: payload.chainId || ChainId.MAINNET
  }
}

//MOD: adds chainId to param
export const fetchTokenList: Readonly<{
  pending: ActionCreatorWithPayload<PendingFetchTokenList>
  fulfilled: ActionCreatorWithPayload<FulfilledFetchTokenList>
  rejected: ActionCreatorWithPayload<RejectedFetchTokenList>
}> = {
  pending: createAction<PendingFetchTokenList>('lists/fetchTokenList/pending'),
  fulfilled: createAction<FulfilledFetchTokenList>('lists/fetchTokenList/fulfilled'),
  rejected: createAction<RejectedFetchTokenList>('lists/fetchTokenList/rejected')
}
// add and remove from list options
export const addList = createAction<WithChainIdAndUrl>('lists/addList')
export const removeList = createAction<WithChainIdAndUrl>('lists/removeList')

// select which lists to search across from loaded lists
export const enableList = createAction<WithChainIdAndUrl>('lists/enableList')
export const disableList = createAction<WithChainIdAndUrl>('lists/disableList')

// versioning
export const acceptListUpdate = createAction<WithChainIdAndUrl>('lists/acceptListUpdate')
export const rejectVersionUpdate = createAction<Omit<WithChainIdAndUrl, 'url'> & { version: Version }>(
  'lists/rejectVersionUpdate'
)
