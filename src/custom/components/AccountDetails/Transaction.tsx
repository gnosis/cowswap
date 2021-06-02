import React, { useCallback, useState } from 'react'
import { AlertCircle, CheckCircle, XCircle, Triangle } from 'react-feather'

import { useActiveWeb3React } from 'hooks'
import { getEtherscanLink, shortenOrderId } from 'utils'
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
import {
  ConfirmationModalContent,
  ConfirmationPendingContent,
  TransactionErrorContent
} from 'components/TransactionConfirmationModal'

import { ActivityStatus, ActivityType, useActivityDescriptors } from 'hooks/useRecentActivity'
import { useCancelOrder } from 'hooks/useCancelOrder'
import Modal from 'components/Modal'
import { ButtonPrimary } from 'components/Button'

const PILL_COLOUR_MAP = {
  CONFIRMED: '#1b7b43',
  PENDING_ORDER: '#8958FF',
  PENDING_TX: '#2b68fa',
  EXPIRED_ORDER: '#b94d54'
}

function determinePillColour(status: ActivityStatus, type: ActivityType) {
  const isOrder = type === ActivityType.ORDER
  switch (status) {
    case ActivityStatus.PENDING:
      return isOrder ? PILL_COLOUR_MAP.PENDING_ORDER : PILL_COLOUR_MAP.PENDING_TX
    case ActivityStatus.CONFIRMED:
      return PILL_COLOUR_MAP.CONFIRMED
    case ActivityStatus.EXPIRED:
    case ActivityStatus.CANCELLED:
      return PILL_COLOUR_MAP.EXPIRED_ORDER
  }
}

function getActivitySummary({
  id,
  activityData
}: {
  id: string
  activityData: ReturnType<typeof useActivityDescriptors>
}) {
  if (!activityData) return null

  const { summary, status, type } = activityData

  const isMeta = type === ActivityType.ORDER && status !== ActivityStatus.CONFIRMED

  // add arrow indicating clickable link if not meta tx
  const suffix = !isMeta ? ' ↗' : ''
  const baseSummary = summary ?? id

  return baseSummary + suffix
}

const RowWrapper = styled(TransactionWrapper)`
  display: flex;
`

// override the href, pending and success props
// override mouse actions via CSS when we dont want a clickable row
const TransactionState = styled(OldTransactionState).attrs(
  (props): { href?: string; disableMouseActions?: boolean; pending?: boolean; success?: boolean } => props
)`
  ${(props): string | false => !!props.disableMouseActions && `pointer-events: none; cursor: none;`}
`

type CancellationModalProps = {
  onDismiss: () => void
  isOpen: boolean
  orderId: string
  summary: string | undefined
}

function CancellationModal(props: CancellationModalProps): JSX.Element | null {
  const { orderId, isOpen, onDismiss, summary } = props
  const shortId = shortenOrderId(orderId)

  const [status, setStatus] = useState<'not started' | 'waiting for wallet' | 'error'>('not started')
  const [error, setError] = useState('')
  const cancelOrder = useCancelOrder()

  const onClick = useCallback(() => {
    setStatus('waiting for wallet')
    cancelOrder(orderId)
      .then(() => {
        // TODO: toast notification
        onDismiss()
      })
      .catch(e => {
        setError(e.message)
        setStatus('error')
      })
  }, [cancelOrder, onDismiss, orderId])

  return (
    <Modal isOpen={isOpen} onDismiss={onDismiss}>
      {status === 'waiting for wallet' ? (
        <ConfirmationPendingContent
          onDismiss={onDismiss}
          pendingText={`Soft cancelling order with id ${shortId}\n\n${summary}`}
        />
      ) : status === 'error' ? (
        <TransactionErrorContent onDismiss={onDismiss} message={error || 'Failed to cancel order'} />
      ) : (
        <>
          <ConfirmationModalContent
            title="Cancel order"
            onDismiss={onDismiss}
            topContent={() => (
              <>
                <p>
                  Are you sure you want to cancel the order <em>{shortId}</em>?
                </p>
                <p>{summary}</p>
                <p>Keep in mind this is a soft cancellation, and will be taken into account in a best effort basis.</p>
                <p>
                  This means that a solver might already have included the order in a solution even if this cancellation
                  is successful.
                </p>
              </>
            )}
            bottomContent={() =>
              status === 'not started' && <ButtonPrimary onClick={onClick}>Cancel order</ButtonPrimary>
            }
          />
        </>
      )}
    </Modal>
  )
}

export default function Transaction({ hash: id }: { hash: string }) {
  const { chainId } = useActiveWeb3React()
  // Return info necessary for rendering order/transaction info from the incoming id
  // returns info related to activity: TransactionDetails | Order
  const activityData = useActivityDescriptors({ id, chainId })

  if (!activityData || !chainId) return null

  const { activity, status, type } = activityData

  const isPending = status === ActivityStatus.PENDING
  const isConfirmed = status === ActivityStatus.CONFIRMED
  const isExpired = status === ActivityStatus.EXPIRED
  const isCancelled = status === ActivityStatus.CANCELLED

  return (
    <RowWrapper>
      <TransactionState href={getEtherscanLink(chainId, id, 'transaction')}>
        <RowFixed>
          {activity && (
            <Pill color="#fff" bgColor={determinePillColour(status, type)} minWidth="3.5rem">
              {type}
            </Pill>
          )}
          <TransactionStatusText>{getActivitySummary({ activityData, id })}</TransactionStatusText>
        </RowFixed>
        <IconWrapper pending={isPending} success={isConfirmed}>
          {isPending ? (
            <Loader />
          ) : isConfirmed ? (
            <CheckCircle size="16" />
          ) : isExpired ? (
            <AlertCircle size="16" />
          ) : isCancelled ? (
            <XCircle size="16" />
          ) : (
            <Triangle size="16" />
          )}
        </IconWrapper>
      </TransactionState>
    </RowWrapper>
  )
}
