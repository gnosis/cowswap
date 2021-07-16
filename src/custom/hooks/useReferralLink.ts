import { useWalletInfo } from './useWalletInfo'

export const REFERRAL_QUERY_PARAM = 'referral'

export function getReferralLink(walletAddress: string): string {
  const url = new URL(window.location.origin)
  url.searchParams.set(REFERRAL_QUERY_PARAM, walletAddress)

  return url.toString()
}

/**
 * Returns the referral link with the connected wallet address
 */
export default function useReferralLink(): string | null {
  const { account } = useWalletInfo()

  if (account) {
    return getReferralLink(account)
  }

  return null
}
