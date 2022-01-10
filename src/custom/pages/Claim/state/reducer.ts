import { Action } from './actions'

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
    case 'setInputAddress':
      return { ...state, inputAddress: action.payload }
    case 'setActiveClaimAccount':
      return { ...state, activeClaimAccount: action.payload }
    case 'setActiveClaimAccountENS':
      return { ...state, activeClaimAccountENS: action.payload }
    case 'setIsSearchUsed':
      return { ...state, isSearchUsed: action.payload }
    case 'setClaimConfirmed':
      return { ...state, claimConfirmed: action.payload }
    case 'setClaimAttempting':
      return { ...state, claimAttempting: action.payload }
    case 'setClaimSubmitted':
      return { ...state, claimSubmitted: action.payload }
    case 'setClaimedAmount':
      return { ...state, claimedAmount: action.payload }
    case 'setIsInvestFlowActive':
      return { ...state, isInvestFlowActive: action.payload }
    case 'setInvestFlowStep':
      return { ...state, investFlowStep: action.payload }
    case 'setSelected':
      return { ...state, selected: [...state.selected, ...action.payload] }
    case 'setSelectedAll':
      return { ...state, selectedAll: action.payload }
    default:
      throw new Error('[Claim::Reducer] No action detected. Check your action dispatcher.')
  }
}
