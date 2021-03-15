import { ActionCreatorWithPreparedPayload, createAction } from '@reduxjs/toolkit'
import { ChainId } from '@uniswap/sdk'
import { TokenList, Version } from '@uniswap/token-lists'
import { DEFAULT_NETWORK_FOR_LISTS } from '@src/custom/constants/lists'

export interface WithChainId {
  chainId?: ChainId
}

interface WithChainIdAndUrl extends WithChainId {
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

// Takes the payload of every action and if no chainId is found, sets to default
// found in constants/index::DEFAULT_NETWORK_FOR_LISTS
// allows us not to have to make this change in many places
export const setDefaultChainId = <T extends WithChainId>(payload: T) => ({
  payload: {
    ...payload,
    chainId: payload.chainId || DEFAULT_NETWORK_FOR_LISTS
  }
})

//MOD: adds chainId to param
export const fetchTokenList: Readonly<{
  pending: ActionCreatorWithPreparedPayload<PendingFetchTokenList[], Required<PendingFetchTokenList>>
  fulfilled: ActionCreatorWithPreparedPayload<FulfilledFetchTokenList[], Required<FulfilledFetchTokenList>>
  rejected: ActionCreatorWithPreparedPayload<RejectedFetchTokenList[], Required<RejectedFetchTokenList>>
}> = {
  pending: createAction('lists/fetchTokenList/pending', (payload: PendingFetchTokenList) => setDefaultChainId(payload)),
  fulfilled: createAction('lists/fetchTokenList/fulfilled', (payload: FulfilledFetchTokenList) =>
    setDefaultChainId(payload)
  ),
  rejected: createAction('lists/fetchTokenList/rejected', (payload: RejectedFetchTokenList) =>
    setDefaultChainId(payload)
  )
}
// add and remove from list options
export const addList = createAction('lists/addList', (payload: WithChainIdAndUrl) => setDefaultChainId(payload))
export const removeList = createAction('lists/removeList', (payload: WithChainIdAndUrl) => setDefaultChainId(payload))

// select which lists to search across from loaded lists
export const enableList = createAction('lists/enableList', (payload: WithChainIdAndUrl) => setDefaultChainId(payload))
export const disableList = createAction('lists/disableList', (payload: WithChainIdAndUrl) => setDefaultChainId(payload))

// versioning
export const acceptListUpdate = createAction('lists/acceptListUpdate', (payload: WithChainIdAndUrl) =>
  setDefaultChainId(payload)
)
export const rejectVersionUpdate = createAction(
  'lists/rejectVersionUpdate',
  (payload: WithChainId & { version: Version }) => setDefaultChainId(payload)
)
