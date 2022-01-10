import { Action, ActionTypes } from './actions'

export const initialState: ClaimState = {
  // address/ENS address
  inputAddress: '',
  // account
  activeClaimAccount: '',
  activeClaimAccountENS: '',
  // check address
  isSearchUsed: false,
  // claiming
  claimConfirmed: false,
  claimAttempting: false,
  claimSubmitted: false,
  claimedAmount: 0,
  // investment
  isInvestFlowActive: false,
  investFlowStep: 0,
  // table select change
  selected: [],
  selectedAll: false,
}

export type ClaimState = {
  // address/ENS address
  inputAddress: string
  // account
  activeClaimAccount: string
  activeClaimAccountENS: string
  // check address
  isSearchUsed: boolean
  // claiming
  claimConfirmed: boolean
  claimAttempting: boolean
  claimSubmitted: boolean
  claimedAmount: number
  // investment
  isInvestFlowActive: boolean
  investFlowStep: number
  // table select change
  selected: number[]
  selectedAll: boolean
}

export default function reducer(state: ClaimState, action: Action): ClaimState {
  switch (action.type) {
    case ActionTypes.setInputAddress:
      return { ...state, inputAddress: action.payload }
    case ActionTypes.setActiveClaimAccount:
      return { ...state, activeClaimAccount: action.payload }
    case ActionTypes.setActiveClaimAccountENS:
      return { ...state, activeClaimAccountENS: action.payload }
    case ActionTypes.setIsSearchUsed:
      return { ...state, isSearchUsed: action.payload }
    case ActionTypes.setClaimConfirmed:
      return { ...state, claimConfirmed: action.payload }
    case ActionTypes.setClaimAttempting:
      return { ...state, claimAttempting: action.payload }
    case ActionTypes.setClaimSubmitted:
      return { ...state, claimSubmitted: action.payload }
    case ActionTypes.setClaimedAmount:
      return { ...state, claimedAmount: action.payload }
    case ActionTypes.setIsInvestFlowActive:
      return { ...state, isInvestFlowActive: action.payload }
    case ActionTypes.setInvestFlowStep:
      return { ...state, investFlowStep: action.payload }
    case ActionTypes.setSelected:
      return { ...state, selected: [...state.selected, ...action.payload] }
    case ActionTypes.setSelectedAll:
      return { ...state, selectedAll: action.payload }
    default:
      throw new Error('[Claim::Reducer] No action detected. Check your action dispatcher.')
  }
}
