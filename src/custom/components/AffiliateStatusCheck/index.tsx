import React, { useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom'
import { useActiveWeb3React } from 'hooks/web3'
import NotificationBanner from 'components/NotificationBanner'
import { useReferralAddress, useResetReferralAddress } from 'state/affiliate/hooks'
import { updateAppDataHash } from 'state/affiliate/actions'
import { useAppDispatch } from 'state/hooks'
import { hasTrades } from 'utils/trade'
import { uploadAppDataDoc } from 'utils/operator'
import { generateReferralMetadataDoc } from 'utils/metadata'

type AffiliateStatus = 'NOT_CONNECTED' | 'OWN_LINK' | 'ALREADY_TRADED' | 'ACTIVE'

const STATUS_TO_MESSAGE_MAPPING: Record<AffiliateStatus, string> = {
  NOT_CONNECTED: 'Please connect your wallet to participate',
  OWN_LINK: 'You followed your own referral link',
  ALREADY_TRADED: 'You have already traded with the current account',
  ACTIVE: 'Your affiliate link will be effective on next trade',
}

export default function AffiliateStatusCheck() {
  const appDispatch = useAppDispatch()
  const resetReferralAddress = useResetReferralAddress()
  const history = useHistory()
  const { account, chainId } = useActiveWeb3React()
  const referralAddress = useReferralAddress()
  const [affiliateState, setAffiliateState] = useState<AffiliateStatus | undefined>()

  useEffect(() => {
    if (!referralAddress) {
      return
    }

    if (referralAddress && !account) {
      setAffiliateState('NOT_CONNECTED')
      return
    }

    if (referralAddress === account) {
      // clean-up saved referral address if the user follows its own referral link
      resetReferralAddress()
      history.push('/profile')
      setAffiliateState('OWN_LINK')
      return
    }

    async function uploadDataDoc() {
      if (!chainId || !account || !referralAddress) {
        return
      }

      // we first validate that the user hasn't already traded
      const userHasTrades = await hasTrades(chainId, account)

      if (userHasTrades) {
        resetReferralAddress()
        setAffiliateState('ALREADY_TRADED')
        return
      }

      const appDataHash = await uploadAppDataDoc({ chainId, metadata: generateReferralMetadataDoc(referralAddress) })

      appDispatch(updateAppDataHash(appDataHash))

      setAffiliateState('ACTIVE')
    }

    uploadDataDoc()
  }, [referralAddress, account, resetReferralAddress, history, chainId, appDispatch])

  if (affiliateState) {
    return (
      <NotificationBanner isVisible={true} level="info">
        Affiliate program: {STATUS_TO_MESSAGE_MAPPING[affiliateState]}
      </NotificationBanner>
    )
  }

  return null
}
