import { Trans } from '@lingui/macro'
import { ButtonSecondary } from 'components/Button'
import { ExternalLink } from 'theme'
import { IntroDescription } from './styled'
import { ClaimCommonTypes } from './types'
import { useClaimDispatchers, useClaimState } from 'state/claim/hooks'

type ClaimIntroductionProps = Pick<ClaimCommonTypes, 'hasClaims'> & {
  isAirdropOnly: boolean
}

export default function CanUserClaimMessage({ hasClaims, isAirdropOnly }: ClaimIntroductionProps) {
  const { activeClaimAccount, claimAttempting, claimConfirmed } = useClaimState()
  const { setActiveClaimAccount } = useClaimDispatchers()

  const canClaim = !claimAttempting && !claimConfirmed && hasClaims && isAirdropOnly

  // only show when active claim account
  if (!activeClaimAccount) return null

  if (canClaim) {
    return (
      <IntroDescription>
        <p>
          <Trans>
            Thank you for being a supporter of CowSwap and the CoW protocol. As an important member of the CowSwap
            Community you may claim vCOW to be used for voting and governance. You can claim your tokens until{' '}
            <i>[XX-XX-XXXX - XX:XX GMT]</i>
            <ExternalLink href="https://cow.fi/">Read more about vCOW</ExternalLink>
          </Trans>
        </p>
      </IntroDescription>
    )
  } else {
    return (
      <IntroDescription>
        <Trans>
          Unfortunately this account is not eligible for any vCOW claims.{' '}
          <ButtonSecondary onClick={() => setActiveClaimAccount('')} padding="0">
            Try another account
          </ButtonSecondary>{' '}
          or <ExternalLink href="https://cow.fi/">read more about vCOW</ExternalLink>
        </Trans>
      </IntroDescription>
    )
  }
}
