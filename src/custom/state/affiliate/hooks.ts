import { useCallback, useState, useEffect } from 'react'
import { useActiveWeb3React } from 'hooks/web3'
import { useSelector } from 'react-redux'
import { AppState } from 'state'
import { useAppDispatch } from 'state/hooks'
import { getAllTrades, getAllOrder } from 'api/gnosisProtocol/api'
import { updateReferralAddress } from 'state/affiliate/actions'
import { decodeAppData } from 'utils/metadata'
import { APP_DATA_HASH } from 'constants/index'

export function useAppDataHash() {
  return useSelector<AppState, string>((state) => {
    return state.affiliate.appDataHash || APP_DATA_HASH
  })
}

export function useReferralAddress() {
  return useSelector<
    AppState,
    | {
        value: string
        isValid: boolean
      }
    | undefined
  >((state) => {
    return state.affiliate.referralAddress
  })
}

export function useResetReferralAddress() {
  const dispatch = useAppDispatch()

  return useCallback(() => dispatch(updateReferralAddress(null)), [dispatch])
}

export function useIsNotificationClosed(id?: string): boolean | null {
  return useSelector<AppState, boolean | null>((state) => {
    return id ? state.affiliate.isNotificationClosed?.[id] ?? false : null
  })
}

export function useReferredByAddress() {
  const [referredAddress, setReferredAddress] = useState<string>('')
  const { account, chainId } = useActiveWeb3React()

  useEffect(() => {
    const fetchReferredAddress = async () => {
      if (!chainId || !account) return
      try {
        const allTrades = await getAllTrades({ chainId, owner: account, limit: 1 })
        const order = await getAllOrder(chainId, allTrades[0]?.orderUid)
        const appDataDecoded = order?.appData && (await decodeAppData(order?.appData.toString()))
        setReferredAddress(appDataDecoded.metadata.referrer.address)
      } catch {
        setReferredAddress('')
      }
    }
    fetchReferredAddress()
  }, [account, chainId])

  return { value: referredAddress }
}
