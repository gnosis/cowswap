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
export const setInputAddress = (payload: string): Action => ({ type: ActionTypes.setInputAddress, payload })
export const setActiveClaimAccount = (payload: string): Action => ({ type: ActionTypes.setActiveClaimAccount, payload })
export const setActiveClaimAccountENS = (payload: string): Action => ({
  type: ActionTypes.setActiveClaimAccountENS,
  payload,
})

// search
export const setIsSearchUsed = (payload: boolean): Action => ({ type: ActionTypes.setIsSearchUsed, payload })

// claiming
export const setClaimConfirmed = (payload: boolean): Action => ({ type: ActionTypes.setClaimConfirmed, payload })
export const setClaimAttempting = (payload: boolean): Action => ({ type: ActionTypes.setClaimAttempting, payload })
export const setClaimSubmitted = (payload: boolean): Action => ({ type: ActionTypes.setClaimSubmitted, payload })
export const setClaimedAmount = (payload: number): Action => ({ type: ActionTypes.setClaimedAmount, payload })

// investing
export const setIsInvestFlowActive = (payload: boolean): Action => ({
  type: ActionTypes.setIsInvestFlowActive,
  payload,
})
export const setInvestFlowStep = (payload: number): Action => ({ type: ActionTypes.setInvestFlowStep, payload })

// claim row selection
export const setSelected = (payload: number[]): Action => ({ type: ActionTypes.setSelected, payload })
export const setSelectedAll = (payload: boolean): Action => ({ type: ActionTypes.setSelectedAll, payload })
