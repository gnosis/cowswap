import { createAction } from '@reduxjs/toolkit'

export const enum ActionTypes {
  // accounts/address
  setInputAddress = 'setInputAddress',
  setActiveClaimAccount = 'setActiveClaimAccount',
  setActiveClaimAccountENS = 'setActiveClaimAccountENS',
  // claiming
  setClaimConfirmed = 'setClaimConfirmed',
  setClaimAttempting = 'setClaimAttempting',
  setClaimSubmitted = 'setClaimSubmitted',
  setClaimedAmount = 'setClaimedAmount',
  // investment
  setIsInvestFlowActive = 'setIsInvestFlowActive',
  setInvestFlowStep = 'setInvestFlowStep',
  // search
  setIsSearchUsed = 'setIsSearchUsed',
  // selected claim rows (table/UI)
  setSelected = 'setSelected',
  setSelectedAll = 'setSelectedAll',
}

export type Action =
  | {
      type: ActionTypes.setInputAddress | ActionTypes.setActiveClaimAccount | ActionTypes.setActiveClaimAccountENS
      payload: string
    }
  | {
      type:
        | ActionTypes.setIsSearchUsed
        | ActionTypes.setClaimConfirmed
        | ActionTypes.setClaimAttempting
        | ActionTypes.setClaimSubmitted
        | ActionTypes.setIsInvestFlowActive
        | ActionTypes.setSelectedAll
      payload: boolean
    }
  | { type: ActionTypes.setClaimedAmount | ActionTypes.setInvestFlowStep; payload: number }
  | { type: ActionTypes.setSelected; payload: number[] }

export type ClaimActions = {
  // account
  setInputAddress: (payload: string) => void
  setActiveClaimAccount: (payload: string) => void
  setActiveClaimAccountENS: (payload: string) => void
  // search
  setIsSearchUsed: (payload: boolean) => void
  // claiming
  setClaimConfirmed: (payload: boolean) => void
  setClaimAttempting: (payload: boolean) => void
  setClaimSubmitted: (payload: boolean) => void
  setClaimedAmount: (payload: number) => void
  // investing
  setIsInvestFlowActive: (payload: boolean) => void
  setInvestFlowStep: (payload: number) => void
  // claim row selection
  setSelected: (payload: number[]) => void
  setSelectedAll: (payload: boolean) => void
}

// accounts
// export const setInputAddress = (payload: string): Action => ({ type: ActionTypes.setInputAddress, payload })
export const setInputAddress = createAction<string>(ActionTypes.setInputAddress)
export const setActiveClaimAccount = createAction<string>(ActionTypes.setActiveClaimAccount)
export const setActiveClaimAccountENS = createAction<string>(ActionTypes.setActiveClaimAccountENS)

// search
export const setIsSearchUsed = createAction<string>(ActionTypes.setIsSearchUsed)

// claiming
export const setClaimConfirmed = createAction<boolean>(ActionTypes.setClaimConfirmed)
export const setClaimAttempting = createAction<boolean>(ActionTypes.setClaimAttempting)
export const setClaimSubmitted = createAction<boolean>(ActionTypes.setClaimSubmitted)
export const setClaimedAmount = createAction<number>(ActionTypes.setClaimedAmount)

// investing
export const setIsInvestFlowActive = createAction<boolean>(ActionTypes.setIsInvestFlowActive)
export const setInvestFlowStep = createAction<number>(ActionTypes.setInvestFlowStep)

// claim row selection
export const setSelected = createAction<number[]>(ActionTypes.setSelected)
export const setSelectedAll = createAction<boolean>(ActionTypes.setSelectedAll)
