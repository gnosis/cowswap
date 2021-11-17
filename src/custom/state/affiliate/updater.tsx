import { useCallback, useEffect } from 'react'

import { dismissNotification, updateReferralAddress } from 'state/affiliate/actions'
import useParseReferralQueryParam from 'hooks/useParseReferralQueryParam'
import { useAppDispatch } from 'state/hooks'
import { useReferralAddress } from 'state/affiliate/hooks'
import { AffiliateState } from './reducer'

export function ReferralLinkUpdater() {
  const dispatch = useAppDispatch()
  const referralAddressParam = useParseReferralQueryParam()
  const referralAddress = useReferralAddress()

  useEffect(() => {
    if (!referralAddressParam && !referralAddress?.isValid) {
      dispatch(updateReferralAddress(null))
    } else if (referralAddressParam) {
      dispatch(updateReferralAddress(referralAddressParam))
    }
  }, [referralAddressParam, referralAddress, dispatch])

  return null
}

export function NotificationClosedUpdater() {
  const dispatch = useAppDispatch()

  const handler = useCallback(
    (e: StorageEvent) => {
      if (e.key === 'redux_localstorage_simple_affiliate' && e.newValue) {
        const parsed = JSON.parse(e.newValue) as AffiliateState
        for (const id in parsed.isNotificationClosed) {
          dispatch(dismissNotification(id))
        }
      }
    },
    [dispatch]
  )

  useEffect(() => {
    window.addEventListener('storage', handler)

    return () => window.removeEventListener('storage', handler)
  }, [handler])

  return null
}

export default function AffiliateUpdaters() {
  return (
    <>
      <ReferralLinkUpdater />
      <NotificationClosedUpdater />
    </>
  )
}
