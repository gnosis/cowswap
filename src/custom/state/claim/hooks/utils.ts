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
  return claims?.some((claim) => PAID_CLAIM_TYPES.includes(claim.type)) || false
}

/**
 * Helper function to check whether any claim is an airdrop option
 *
 * @param claims
 */
export function hasFreeClaim(claims: UserClaims | null): boolean {
  return claims?.some((claim) => FREE_CLAIM_TYPES.includes(claim.type)) || false
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
  const vCow = chainId ? V_COW[chainId || 4] : undefined
  if (!vCow || !value) return undefined
  return CurrencyAmount.fromRawAmount(vCow, value)
}

export type TypeToCurrencyMapper = {
  [key: string]: string
}

/**
 * Helper function to transform claim data type to coin name that can be displayed in the UI
 *
 * @param chainId
 */
export function getTypeToCurrencyMap(chainId: number | undefined): TypeToCurrencyMapper {
  if (!chainId) return {}

  const map: TypeToCurrencyMapper = {
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

  return map
}

export type TypeToPriceMapper = {
  [key: string]: number
}

/**
 * Helper function to get vCow price based on claim type and chainId
 *
 * @param type
 */
export function getTypeToPriceMap(): TypeToPriceMapper {
  const map: TypeToPriceMapper = {
    GnoOption: 16.66,
    Investor: 26.66,
    UserOption: 36.66,
  }

  return map
}

/**
 * Helper function to check if current type is free claim
 *
 * @param type
 */
export function isFreeClaim(type: ClaimType): boolean {
  return FREE_CLAIM_TYPES.includes(type)
}
