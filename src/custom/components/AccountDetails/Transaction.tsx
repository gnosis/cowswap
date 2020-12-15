import React from 'react'
import { CheckCircle, Triangle } from 'react-feather'

import { useActiveWeb3React } from 'hooks'
import { getEtherscanLink } from 'utils'
import { RowFixed } from 'components/Row'
import Loader from 'components/Loader'
import {
  TransactionWrapper,
  TransactionState as OldTransactionState,
  TransactionStatusText,
  IconWrapper
} from './TransactionMod'
import Pill from '../Pill'
import styled from 'styled-components'

import { ActivityType, useActivityDescriptors } from 'hooks/useRecentActivity'

function determinePillColour(success: boolean, type: ActivityType) {
  const isPendingOrder = !success && type === ActivityType.ORDER,
    isFulfilledOrder = success && type === ActivityType.ORDER,
    isPendingTx = !success && type === ActivityType.TX,
    isFulfilledTx = success && type === ActivityType.TX

  if (isPendingOrder) return '#8958FF'
  else if (isFulfilledOrder) return '#1b7b43'
  else if (isPendingTx) return '#2b68fa'
  else if (isFulfilledTx) return '#1b7b43'
  else return 'transparent'
}

function getActivitySummary({
  id,
  activityData
}: {
  id: string
  activityData: ReturnType<typeof useActivityDescriptors>
}) {
  if (!activityData) return null

  const { summary, pending, type } = activityData

  const isMeta = type === ActivityType.ORDER && pending

  // add arrow indiciating clickable link if not meta tx
  const suffix = !isMeta ? ' ↗' : ''
  const baseSummary = summary ?? id

  return baseSummary + suffix
}

// override the href prop when we dont want a clickable row
const TransactionState = styled(OldTransactionState).attrs((props): { href?: string } => ({
  href: props.href
}))``

export default function Transaction({ hash: id }: { hash: string }) {
  const { chainId } = useActiveWeb3React()
  // Return info necessary for rendering order/transaction info from the incoming id
  const activityData = useActivityDescriptors({ id, chainId })

  if (!activityData || !chainId) return null

  const { activity, pending, success, type } = activityData
  const isOrder = type === ActivityType.ORDER

  return (
    <TransactionWrapper>
      <TransactionState
        // trnsaction? fulfilled order? render etherscan link. meta-tx? don't do that
        href={!isOrder ? getEtherscanLink(chainId, id, 'transaction') : undefined}
        pending={pending}
        success={success}
      >
        <RowFixed>
          {activity && (
            <Pill color="#fff" bgColor={determinePillColour(success, type)} minWidth="3.5rem">
              {type}
            </Pill>
          )}
          <TransactionStatusText>{getActivitySummary({ activityData, id })}</TransactionStatusText>
        </RowFixed>
        <IconWrapper pending={pending} success={success}>
          {pending ? <Loader /> : success ? <CheckCircle size="16" /> : <Triangle size="16" />}
        </IconWrapper>
      </TransactionState>
    </TransactionWrapper>
  )
}
