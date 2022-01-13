import { CurrencyAmount, Token } from '@uniswap/sdk-core'
import { SupportedChainId } from 'constants/chains'
import { V_COW } from 'constants/tokens'
import {
  CLAIMS_REPO,
  ClaimType,
  FREE_CLAIM_TYPES,
  PAID_CLAIM_TYPES,
  RepoClaims,
  UserClaims,
  NATIVE_TOKEN_PRICE,
  GNO_PRICE,
  USDC_PRICE,
  NATIVE_TOKEN_SYMBOL,
  GNO_SYMBOL,
  USDC_SYMBOL,
} from 'state/claim/hooks/index'
import { USDC, GNO } from 'constants/tokens'

/**
 * Helper function to check whether any claim is an investment option
 *
 * @param claims
 */
export function hasPaidClaim(claims: UserClaims | null): boolean {
  return Boolean(claims?.some((claim) => PAID_CLAIM_TYPES.includes(claim.type)))
}

/**
 * Helper function to check whether any claim is an airdrop option
 *
 * @param claims
 */
export function hasFreeClaim(claims: UserClaims | null): boolean {
  return Boolean(claims?.some((claim) => FREE_CLAIM_TYPES.includes(claim.type)))
}

/**
 * Helper function to transform data as coming from the airdrop claims repo onto internal types
 *
 * Namely, converting types from their string representations to the enum numbers:
 * Airdrop -> 0
 */
export function transformRepoClaimsToUserClaims(repoClaims: RepoClaims): UserClaims {
  return repoClaims.map((claim) => ({ ...claim, type: ClaimType[claim.type] }))
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
 * Helper function to transform claim data amount to CurrencyAmount
 *
 */
export function parseClaimAmount(
  value: string,
  chainId: number | undefined,
  type?: ClaimType
): CurrencyAmount<Token> | undefined {
  if (!chainId) return undefined

  let token = V_COW[chainId]

  if (type) {
    switch (type) {
      case ClaimType.GnoOption:
        token = GNO[chainId]
        break
      case ClaimType.Investor:
        token = USDC
        break
      default:
        break
    }
  }

  if (!token || !value) {
    return undefined
  }

  return CurrencyAmount.fromRawAmount(token, value)
}

export type TypeToCurrencyMapper = {
  [key: string]: string
}

/**
 * Helper function to transform claim data type to coin name that can be displayed in the UI
 *
 * @param chainId
 */
export function mapTypeToCurrency(type: ClaimType, chainId: SupportedChainId | undefined): string | undefined {
  if (!chainId) return undefined

  const map: TypeToCurrencyMapper = {
    [ClaimType.GnoOption]: GNO_SYMBOL,
    [ClaimType.Investor]: USDC_SYMBOL,
    [ClaimType.UserOption]: NATIVE_TOKEN_SYMBOL[chainId],
  }

  return map[type]
}

export type TypeToPriceMapper = {
  [key: string]: string
}

/**
 * Helper function to get vCow price based on claim type and chainId
 *
 * @param type
 */
export function mapTypeToPrice(
  type: ClaimType,
  chainId: SupportedChainId | undefined
): CurrencyAmount<Token> | undefined {
  if (!chainId) return undefined

  const map: TypeToPriceMapper = {
    [ClaimType.GnoOption]: GNO_PRICE,
    [ClaimType.Investor]: USDC_PRICE,
    [ClaimType.UserOption]: NATIVE_TOKEN_PRICE[chainId],
  }

  return parseClaimAmount(map[type], chainId, type)
}

/**
 * Helper function to check if current type is free claim
 *
 * @param type
 */
export function isFreeClaim(type: ClaimType): boolean {
  return FREE_CLAIM_TYPES.includes(type)
}

/**
 * Helper function to return an array of indexes from claim data
 *
 * @param type
 */
export function getIndexes(data: UserClaims): number[] {
  return data.map(({ index }) => index)
}

/**
 * Helper function to get the repo path for the corresponding network id
 * Throws when passed an unknown network id
 */
export function getClaimsRepoPath(id: SupportedChainId): string {
  return `${CLAIMS_REPO}${_repoNetworkIdMapping(id)}/`
}

function _repoNetworkIdMapping(id: SupportedChainId): string {
  switch (id) {
    case SupportedChainId.MAINNET:
      return 'mainnet'
    case SupportedChainId.RINKEBY:
      return 'rinkeby'
    case SupportedChainId.XDAI:
      return 'gnosis-chain'
    default:
      throw new Error('Network not supported')
  }
}

/**
 * Helper function to get the claim key based on account and chainId
 */
export function getClaimKey(account: string, chainId: number): string {
  return `${chainId}:${account}`
}
