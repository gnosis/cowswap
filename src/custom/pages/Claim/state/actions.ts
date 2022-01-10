export type Action =
  | { type: 'setInputAddress' | 'setActiveClaimAccount' | 'setActiveClaimAccountENS'; payload: string }
  | {
      type:
        | 'setIsSearchUsed'
        | 'setClaimConfirmed'
        | 'setClaimAttempting'
        | 'setClaimSubmitted'
        | 'setIsInvestFlowActive'
        | 'setSelectedAll'
      payload: boolean
    }
  | { type: 'setClaimedAmount' | 'setInvestFlowStep'; payload: number }
  | { type: 'setSelected'; payload: number[] }

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
export const setInputAddress = (payload: string): Action => ({ type: 'setInputAddress', payload })
export const setActiveClaimAccount = (payload: string): Action => ({ type: 'setActiveClaimAccount', payload })
export const setActiveClaimAccountENS = (payload: string): Action => ({ type: 'setActiveClaimAccountENS', payload })

// search
export const setIsSearchUsed = (payload: boolean): Action => ({ type: 'setIsSearchUsed', payload })

// claiming
export const setClaimConfirmed = (payload: boolean): Action => ({ type: 'setClaimConfirmed', payload })
export const setClaimAttempting = (payload: boolean): Action => ({ type: 'setClaimAttempting', payload })
export const setClaimSubmitted = (payload: boolean): Action => ({ type: 'setClaimSubmitted', payload })
export const setClaimedAmount = (payload: number): Action => ({ type: 'setClaimedAmount', payload })

// investing
export const setIsInvestFlowActive = (payload: boolean): Action => ({ type: 'setIsInvestFlowActive', payload })
export const setInvestFlowStep = (payload: number): Action => ({ type: 'setInvestFlowStep', payload })

// claim row selection
export const setSelected = (payload: number[]): Action => ({ type: 'setSelected', payload })
export const setSelectedAll = (payload: boolean): Action => ({ type: 'setSelectedAll', payload })
