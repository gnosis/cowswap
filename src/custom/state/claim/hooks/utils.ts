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
  const vCow = chainId ? V_COW[chainId] : undefined
  if (!vCow || !value) return undefined
  return CurrencyAmount.fromRawAmount(vCow, value)
}

/**
 * Helper function to transform claim data type to coin name that can be displayed in the UI
 *
 */
type ClaimOptionType = {
  symbol?: string
  currencyId?: string
}

type TypeMap = {
  [option: string]: ClaimOptionType
}

export function typeToCurrencyMapper(type: ClaimType, chainId: number | undefined): ClaimOptionType | undefined {
  if (!type || !chainId) return undefined

  const map: TypeMap = {
    GnoOption: {
      symbol: 'GNO',
      currencyId: undefined,
    },
    Investor: {
      symbol: 'USDC',
      currencyId: undefined,
    },
    UserOption: {
      symbol: undefined,
      currencyId: undefined,
    },
  }

  switch (chainId) {
    case SupportedChainId.MAINNET:
      map.GnoOption.currencyId = '0x6810e776880C02933D47DB1b9fc05908e5386b96'
      map.Investor.currencyId = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
      map.UserOption.currencyId = 'ETH'
      map.UserOption.symbol = 'ETH'
      break
    case SupportedChainId.RINKEBY:
      map.GnoOption.currencyId = '0xd0Dab4E640D95E9E8A47545598c33e31bDb53C7c'
      map.Investor.currencyId = '0x4DBCdF9B62e891a7cec5A2568C3F4FAF9E8Abe2b'
      map.UserOption.currencyId = 'ETH'
      map.UserOption.symbol = 'ETH'
      break
    case SupportedChainId.XDAI:
      map.GnoOption.currencyId = '0x9C58BAcC331c9aa871AFD802DB6379a98e80CEdb'
      map.Investor.currencyId = '0xDDAfbb505ad214D7b80b1f830fcCc89B60fb7A83'
      map.UserOption.currencyId = 'ETH'
      map.UserOption.symbol = 'XDAI'
      break
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
