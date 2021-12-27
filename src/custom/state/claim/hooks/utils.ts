import {
  FREE_CLAIM_TYPES,
  PAID_CLAIM_TYPES,
  RepoClaims,
  REVERSE_CLAIM_TYPE_MAPPING,
  UserClaims,
} from 'state/claim/hooks/index'
import { CurrencyAmount, Token } from '@uniswap/sdk-core'
import { V_COW } from 'constants/tokens'
import { ClaimType } from 'state/claim/hooks'
import { SupportedChainId } from 'constants/chains'
/**
 * Helper function to check whether any claim is an investment option
 *
 * @param claims
 */
export function hasPaidClaim(claims: UserClaims | null): boolean {
  return claims?.some((claim) => claim.type in PAID_CLAIM_TYPES) || false
}

/**
 * Helper function to check whether any claim is an airdrop option
 *
 * @param claims
 */
export function hasFreeClaim(claims: UserClaims | null): boolean {
  return claims?.some((claim) => claim.type in FREE_CLAIM_TYPES) || false
}

/**
 * Helper function to return an array of investment option claims
 *
 * @param claims
 */
export function getPaidClaims(claims: UserClaims): UserClaims {
  return claims?.filter((claim) => PAID_CLAIM_TYPES.includes(claim.type))
}

/**
 * Helper function to return an array of free claims
 *
 * @param claims
 */
export function getFreeClaims(claims: UserClaims): UserClaims {
  return claims?.filter((claim) => FREE_CLAIM_TYPES.includes(claim.type))
}

/**
 * Helper function to transform data as coming from the airdrop claims repo onto internal types
 *
 * Namely, converting types from their string representations to the enum numbers:
 * Airdrop -> 0
 */
export function transformRepoClaimsToUserClaims(repoClaims: RepoClaims): UserClaims {
  return repoClaims.map((claim) => ({ ...claim, type: REVERSE_CLAIM_TYPE_MAPPING[claim.type] }))
}

/**
 * Helper function to transform claim data amount to CurrencyAmount
 *
 */
export function parseClaimAmount(value: string, chainId: number | undefined): CurrencyAmount<Token> | undefined {
  const vCow = chainId ? V_COW[chainId] : undefined
  if (!vCow || !value) return undefined
  return CurrencyAmount.fromRawAmount(vCow, value)
}

/**
 * Helper function to transform claim data type to coin name that can be displayed in the UI
 *
 */
export function typeToCurrencyMapper(type: ClaimType, chainId: number | undefined) {
  if (!type || !chainId) return undefined

  const map: any = {
    GnoOption: 'GNO',
    Investor: 'USDC',
    UserOption: '',
  }

  if ([SupportedChainId.MAINNET, SupportedChainId.RINKEBY].includes(chainId)) {
    map.UserOption = 'ETH'
  }

  if (chainId === SupportedChainId.XDAI) {
    map.UserOption = 'XDAI'
  }

  return map[type]
}

/**
 * Helper function to check if current type is free claim
 *
 */
export function isFreeClaim(type: ClaimType): boolean {
  return FREE_CLAIM_TYPES.includes(type)
}
