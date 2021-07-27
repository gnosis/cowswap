import React, { useEffect } from 'react'

import { updateAffiliateLink } from '@src/state/affiliate/actions'
import useReferralLink from '../../custom/hooks/useReferralLink'
import { useWalletInfo } from '../../custom/hooks/useWalletInfo'
import { useAppDispatch } from '@src/state/hooks'

export default function ReferralLinkUpdater() {
  const dispatch = useAppDispatch()
  const referralLink = useReferralLink()
  const { account } = useWalletInfo()

  useEffect(() => {
    if (referralLink) {
      dispatch(updateAffiliateLink({ affiliateLink: referralLink }))
    }
  }, [account, referralLink, dispatch])

  return null
}
