import React, { useCallback, useEffect, useState } from 'react'
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
import { LinkStyledButton } from 'theme'
import Modal from 'components/Modal'
import { ButtonPrimary } from 'components/Button'

const PILL_COLOUR_MAP = {
  CONFIRMED: '#1b7b43',
  PENDING_ORDER: '#8958FF',
  PENDING_TX: '#2b68fa',
  EXPIRED_ORDER: '#b94d54',
  CANCELLED_ORDER: '#808080'
}

function determinePillColour(status: ActivityStatus, type: ActivityType) {
  const isOrder = type === ActivityType.ORDER
  switch (status) {
    case ActivityStatus.PENDING:
      return isOrder ? PILL_COLOUR_MAP.PENDING_ORDER : PILL_COLOUR_MAP.PENDING_TX
    case ActivityStatus.CONFIRMED:
      return PILL_COLOUR_MAP.CONFIRMED
    case ActivityStatus.EXPIRED:
      return PILL_COLOUR_MAP.EXPIRED_ORDER
    case ActivityStatus.CANCELLED:
      return PILL_COLOUR_MAP.CANCELLED_ORDER
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

  & > a {
    width: 100%;
  }
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

  const [isWaitingSignature, setIsWaitingSignature] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showMore, setShowMore] = useState(false)
  const cancelOrder = useCancelOrder()

  const toggleShowMore = () => setShowMore(showMore => !showMore)

  useEffect(() => {
    // Reset status every time orderId changes to avoid race conditions
    setIsWaitingSignature(false)
    setError(null)
  }, [orderId])

  const onClick = useCallback(() => {
    setIsWaitingSignature(true)
    setError(null)

    cancelOrder(orderId)
      .then(onDismiss)
      .catch(e => {
        setError(e.message)
      })
  }, [cancelOrder, onDismiss, orderId])

  return (
    <Modal isOpen={isOpen} onDismiss={onDismiss}>
      {error !== null ? (
        <TransactionErrorContent onDismiss={onDismiss} message={error || 'Failed to cancel order'} />
      ) : isWaitingSignature ? (
        <ConfirmationPendingContent
          onDismiss={onDismiss}
          pendingText={`Soft cancelling order with id ${shortId}\n\n${summary}`}
        />
      ) : (
        <>
          <ConfirmationModalContent
            title="Cancel order"
            onDismiss={onDismiss}
            topContent={() => (
              <>
                <p>
                  Are you sure you want to cancel order <em>{shortId}</em>?
                </p>
                <p>{summary}</p>
                <p>
                  Keep in mind this is a soft cancellation{' '}
                  <LinkStyledButton onClick={toggleShowMore}>[{showMore ? '- less' : '+ more'}]</LinkStyledButton>
                </p>
                {showMore && (
                  <>
                    <p>It will be taken into account in a best effort basis.</p>
                    <p>
                      This means that a solver might already have included the order in a solution even if this
                      cancellation is successful.
                    </p>
                  </>
                )}
              </>
            )}
            bottomContent={() => <ButtonPrimary onClick={onClick}>Cancel order</ButtonPrimary>}
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

  const [showCancelModal, setShowCancelModal] = useState(false)

  if (!activityData || !chainId) return null

  const { activity, status, type } = activityData

  const isPending = status === ActivityStatus.PENDING
  const isConfirmed = status === ActivityStatus.CONFIRMED
  const isExpired = status === ActivityStatus.EXPIRED
  const isCancelled = status === ActivityStatus.CANCELLED
  const isCancellable = isPending && type === ActivityType.ORDER

  const onCancelClick = () => setShowCancelModal(true)
  const onDismiss = () => setShowCancelModal(false)

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
        <IconWrapper pending={isPending} success={isConfirmed || isCancelled}>
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
      {isCancellable && (
        <>
          <LinkStyledButton onClick={onCancelClick}>(cancel)</LinkStyledButton>
          {showCancelModal && (
            <CancellationModal
              orderId={id}
              summary={activityData.summary}
              isOpen={showCancelModal}
              onDismiss={onDismiss}
            />
          )}
        </>
      )}
    </RowWrapper>
  )
}
