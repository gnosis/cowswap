import { createReducer } from '@reduxjs/toolkit'
import {
  setActiveClaimAccount,
  setActiveClaimAccountENS,
  setClaimStatus,
  setClaimedAmount,
  setInputAddress,
  setInvestFlowStep,
  setIsInvestFlowActive,
  setIsSearchUsed,
  setSelected,
  setSelectedAll,
  ClaimStatus,
} from './actions'

export const initialState: ClaimState = {
  // address/ENS address
  inputAddress: '',
  // account
  activeClaimAccount: '',
  activeClaimAccountENS: '',
  // check address
  isSearchUsed: false,
  // claiming
  claimStatus: ClaimStatus.DEFAULT,
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
  claimStatus: ClaimStatus
  claimedAmount: number
  // investment
  isInvestFlowActive: boolean
  investFlowStep: number
  // table select change
  selected: number[]
  selectedAll: boolean
}

export default createReducer(initialState, (builder) =>
  builder
    .addCase(setInputAddress, (state, { payload }) => {
      state.inputAddress = payload
    })
    .addCase(setActiveClaimAccount, (state, { payload }) => {
      state.activeClaimAccount = payload
    })
    .addCase(setActiveClaimAccountENS, (state, { payload }) => {
      state.activeClaimAccountENS = payload
    })
    .addCase(setIsSearchUsed, (state, { payload }) => {
      state.isSearchUsed = payload
    })
    .addCase(setClaimStatus, (state, { payload }) => {
      state.claimStatus = payload
    })
    .addCase(setClaimedAmount, (state, { payload }) => {
      state.claimedAmount = payload
    })
    .addCase(setIsInvestFlowActive, (state, { payload }) => {
      state.isInvestFlowActive = payload
    })
    .addCase(setInvestFlowStep, (state, { payload }) => {
      state.investFlowStep = payload
    })
    .addCase(setSelected, (state, { payload }) => {
      state.selected = payload
    })
    .addCase(setSelectedAll, (state, { payload }) => {
      state.selectedAll = payload
    })
)