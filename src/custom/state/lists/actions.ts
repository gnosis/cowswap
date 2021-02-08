import { ActionCreatorWithPayload, createAction } from '@reduxjs/toolkit'
import { ChainId } from '@uniswap/sdk'
import { TokenList } from '@uniswap/token-lists'
export * from '@src/state/lists/actions'

export interface WithUrlAndChainId {
  url: string
  chainId: ChainId
}

export const fetchTokenList: Readonly<{
  pending: ActionCreatorWithPayload<{ requestId: string } & WithUrlAndChainId>
  fulfilled: ActionCreatorWithPayload<{ tokenList: TokenList; requestId: string } & WithUrlAndChainId>
  rejected: ActionCreatorWithPayload<{ errorMessage: string; requestId: string } & WithUrlAndChainId>
}> = {
  pending: createAction('lists/fetchTokenList/pending'),
  fulfilled: createAction('lists/fetchTokenList/fulfilled'),
  rejected: createAction('lists/fetchTokenList/rejected')
}

export const addList = createAction<WithUrlAndChainId>('lists/addList')
export const removeList = createAction<WithUrlAndChainId>('lists/removeList')
export const selectList = createAction<WithUrlAndChainId>('lists/selectList')
export const acceptListUpdate = createAction<WithUrlAndChainId>('lists/acceptListUpdate')
