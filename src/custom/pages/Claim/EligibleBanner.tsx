import { Trans } from '@lingui/macro'
import { useClaimState } from 'state/claim/hooks'
import { CheckIcon, EligibleBanner as EligibleBannerWrapper } from './styled'

export default function EligibleBanner({ hasClaims }: { hasClaims: boolean }) {
  const { claimAttempting, claimConfirmed, claimSubmitted, activeClaimAccount, isInvestFlowActive } = useClaimState()

  const isEligible =
    !claimAttempting && !claimConfirmed && !claimSubmitted && !!activeClaimAccount && !isInvestFlowActive && hasClaims

  if (!isEligible) return null

  return (
    <EligibleBannerWrapper>
      <CheckIcon />
      <Trans>This account is eligible for vCOW token claims!</Trans>
    </EligibleBannerWrapper>
  )
}
