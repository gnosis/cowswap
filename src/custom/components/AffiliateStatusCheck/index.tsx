import React, { useCallback, useEffect, useState } from 'react'
import { useHistory, useLocation } from 'react-router-dom'
import { useActiveWeb3React } from 'hooks/web3'
import useRecentActivity from 'hooks/useRecentActivity'
import NotificationBanner from 'components/NotificationBanner'
import { useReferralAddress, useResetReferralAddress, useUploadReferralDocAndSetDataHash } from 'state/affiliate/hooks'
import { useAppDispatch } from 'state/hooks'
import { hasTrades } from 'utils/trade'
import { retry, RetryOptions } from 'utils/retry'
import { SupportedChainId } from 'constants/chains'
import useParseReferralQueryParam from 'hooks/useParseReferralQueryParam'
import { OrderStatus } from '@src/custom/state/orders/actions'

type AffiliateStatus = 'NOT_CONNECTED' | 'OWN_LINK' | 'ALREADY_TRADED' | 'ACTIVE' | 'UNSUPPORTED_NETWORK'

const STATUS_TO_MESSAGE_MAPPING: Record<AffiliateStatus, string> = {
  NOT_CONNECTED: 'Affiliate program: Please connect your wallet to participate.',
  OWN_LINK:
    'Affiliate program: Your affiliate code works! Any new user following this link would credit you their trading volume.',
  ALREADY_TRADED:
    'Invalid affiliate code: The currently connected wallet has traded before or is already part of the affiliate program.',
  ACTIVE: 'Valid affiliate code: You can now do your first trade to join the program.',
  UNSUPPORTED_NETWORK: 'Affiliate program: Only Mainnet is supported. Please change the network to participate.',
}

const DEFAULT_RETRY_OPTIONS: RetryOptions = { n: 3, minWait: 1000, maxWait: 3000 }

// One minute in MS (milliseconds not Microsoft)
const MINUTE_MS = 60_0000

export default function AffiliateStatusCheck() {
  const appDispatch = useAppDispatch()
  const resetReferralAddress = useResetReferralAddress()
  const uploadReferralDocAndSetDataHash = useUploadReferralDocAndSetDataHash()
  const history = useHistory()
  const location = useLocation()
  const { account, chainId } = useActiveWeb3React()
  const allRecentActivity = useRecentActivity()
  const referralAddress = useReferralAddress()
  const referralAddressQueryParam = useParseReferralQueryParam()
  const [affiliateState, setAffiliateState] = useState<AffiliateStatus | null>()
  const [error, setError] = useState('')

  const uploadDataDoc = useCallback(async () => {
    if (!chainId || !account || !referralAddress) {
      return
    }

    if (!referralAddress.isValid) {
      setError('The referral address is invalid.')
      return
    }

    try {
      // we first validate that the user hasn't already traded
      const userHasTrades = await retry(() => hasTrades(chainId, account), DEFAULT_RETRY_OPTIONS).promise

      if (userHasTrades) {
        setAffiliateState('ALREADY_TRADED')
        return
      }
    } catch (error) {
      console.error(error)
      setError('There was an error validating existing trades. Please try again.')
      return
    }

    try {
      await retry(() => uploadReferralDocAndSetDataHash(referralAddress.value), DEFAULT_RETRY_OPTIONS).promise

      setAffiliateState('ACTIVE')
    } catch (error) {
      console.error(error)
      setError('There was an error while uploading the referral document to IPFS. Please try again.')
    }
  }, [chainId, account, referralAddress, uploadReferralDocAndSetDataHash])

  useEffect(() => {
    if (!referralAddress) {
      return
    }

    setAffiliateState(null)
    setError('')

    if (!account) {
      setAffiliateState('NOT_CONNECTED')
      return
    }

    if (chainId !== SupportedChainId.MAINNET) {
      setAffiliateState('UNSUPPORTED_NETWORK')
      return
    }

    if (referralAddress.value === account) {
      // clean-up saved referral address if the user follows its own referral link
      history.push('/profile')
      setAffiliateState('OWN_LINK')

      if (referralAddressQueryParam) {
        history.push('/profile' + location.search)
      }
      return
    }

    const hasJustTraded =
      allRecentActivity
        .filter((data) => data.status === OrderStatus.FULFILLED)
        .filter((tx: any) => tx.Date.now() - Date.parse(tx.confirmedTime) < MINUTE_MS).length >= 1

    if (hasJustTraded) {
      setAffiliateState(null)
      resetReferralAddress()
      return
    }

    uploadDataDoc()
  }, [
    referralAddress,
    account,
    history,
    chainId,
    appDispatch,
    uploadDataDoc,
    allRecentActivity,
    resetReferralAddress,
    location.search,
    referralAddressQueryParam,
  ])

  if (error) {
    return (
      <NotificationBanner isVisible level="error">
        Affiliate program error: {error}
      </NotificationBanner>
    )
  }

  if (affiliateState) {
    return (
      <NotificationBanner isVisible level="info">
        {STATUS_TO_MESSAGE_MAPPING[affiliateState]}
      </NotificationBanner>
    )
  }

  return null
}
