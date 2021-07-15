import React, { useCallback, useEffect, useState } from 'react'
// import { AlertCircle, CheckCircle, XCircle, Triangle } from 'react-feather'

import { useActiveWeb3React } from 'hooks/web3'
import { getEtherscanLink, shortenOrderId } from 'utils'
import { RowFixed } from 'components/Row'
import Loader from 'components/Loader'
import {
  // TransactionWrapper,
  TransactionState as OldTransactionState,
  // TransactionStatusText,
  IconWrapper,
} from './TransactionMod'
// import Pill from '../Pill'
import styled from 'styled-components'
import {
  ConfirmationModalContent,
  ConfirmationPendingContent,
  TransactionErrorContent,
} from 'components/TransactionConfirmationModal'

import { ActivityStatus, ActivityType, useActivityDescriptors } from 'hooks/useRecentActivity'
import { useCancelOrder } from 'hooks/useCancelOrder'
import { LinkStyledButton } from 'theme'
import { ButtonPrimary } from 'components/Button'
import { MouseoverTooltip } from 'components/Tooltip'
import { GpModal as Modal } from 'components/WalletModal'

import SVG from 'react-inlinesvg'
import TxArrowsImage from 'assets/images/transaction-arrows.svg'
import TxCheckImage from 'assets/images/transaction-confirmed.svg'

const PILL_COLOUR_MAP = {
  CONFIRMED: '#3B7848',
  PENDING_ORDER: '#43758C',
  PENDING_TX: '#43758C',
  EXPIRED_ORDER: '#ED673A',
  CANCELLED_ORDER: '#ED673A',
  CANCELLING_ORDER: '#43758C',
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
    case ActivityStatus.CANCELLING:
      return PILL_COLOUR_MAP.CANCELLING_ORDER
    case ActivityStatus.CANCELLED:
      return PILL_COLOUR_MAP.CANCELLED_ORDER
  }
}

const IconType = styled.div`
  height: 36px;
  width: 36px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;

  &::before {
    content: '';
    display: block;
    background: ${({ color }) => color};
    position: absolute;
    top: 0;
    left: 0;
    height: inherit;
    width: inherit;
    border-radius: 36px;
    opacity: 0.1;
  }
  svg {
    display: flex;
    margin: auto;
  }

  svg > path {
    width: 100%;
    height: 100%;
    object-fit: contain;
    margin: auto;
    display: block;
    fill: ${({ color }) => color};
  }
`

const Summary = styled.div`
  display: flex;
  flex-flow: column wrap;
  color: ${({ theme }) => theme.text1};

  > b {
    color: inherit;
    font-weight: 500;
    line-height: 1;
    font-size: 15px;
    margin: 0 0 5px;
  }

  > p {
    font-size: 13px;
    font-weight: 400;
    padding: 0;
    margin: 0;
    color: inherit;
  }
`

const TransactionStatusText = styled.div`
  margin: 0 auto 0 16px;
  display: flex;
  align-items: center;

  &:hover {
    text-decoration: none;
  }
`

const StatusLabel = styled.div`
  height: 28px;
  width: 90px;
  background: ${({ color }) => color};
`

function getActivitySummary(params: {
  id: string
  activityData: ReturnType<typeof useActivityDescriptors>
  suffix?: string
  type?: ActivityType
}) {
  const { id, activityData, suffix, type } = params

  if (!activityData) return null

  const { summary } = activityData

  let baseSummary = summary

  if (suffix && baseSummary) {
    // Shorten summary when `suffix` is set and it matches the regex.
    // It should always match the regex
    const match = baseSummary.match(/(Swap\s+[\d.]+)/)
    baseSummary = (match && match.length > 1 ? match[1] + ' … ' : baseSummary + ' ') + suffix
  }

  baseSummary = baseSummary ?? id

  return (
    <Summary>
      <b>{type} ↗</b> <p>{baseSummary}</p>
    </Summary>
  )
}

// override the href, pending and success props
// override mouse actions via CSS when we dont want a clickable row
const TransactionState = styled(OldTransactionState).attrs(
  (props): { href?: string; disableMouseActions?: boolean; pending?: boolean; success?: boolean } => props
)`
  ${(props): string | false => !!props.disableMouseActions && `pointer-events: none; cursor: none;`}
  width: 100%;
  border-radius: 0;
  font-size: initial;
  display: flex;
  margin: 0;
  padding: 16px;
  border-bottom: 1px solid #d9e8ef;
  transition: background 0.2s ease-in-out;

  &:hover {
    background: rgba(217, 232, 239, 0.35);
  }

  ${RowFixed} {
    width: 100%;
  }
`

export const CancellationSummary = styled.span`
  padding: 12px;
  margin: 0;
  border-radius: 6px;
  background: ${({ theme }) => theme.bg4};
`

type RequestCancellationModalProps = {
  onDismiss: () => void
  onClick: () => void
  summary?: string
  shortId: string
}

function RequestCancellationModal(props: RequestCancellationModalProps): JSX.Element {
  const { onDismiss, onClick, summary, shortId } = props

  const [showMore, setShowMore] = useState(false)

  const toggleShowMore = () => setShowMore((showMore) => !showMore)

  return (
    <ConfirmationModalContent
      title={`Cancel order ${shortId}`}
      onDismiss={onDismiss}
      topContent={() => (
        <>
          <p>
            Are you sure you want to cancel order <strong>{shortId}</strong>?
          </p>
          <CancellationSummary>{summary}</CancellationSummary>
          <p>
            Keep in mind this is a soft cancellation{' '}
            <LinkStyledButton onClick={toggleShowMore}>[{showMore ? '- less' : '+ more'}]</LinkStyledButton>
          </p>
          {showMore && (
            <>
              <p>
                This means that a solver might already have included the order in a solution even if this cancellation
                is successful. Read more in the{' '}
                <a target="_blank" href="/#/faq#can-i-cancel-an-order">
                  FAQ
                </a>
                .
              </p>
            </>
          )}
        </>
      )}
      bottomContent={() => <ButtonPrimary onClick={onClick}>Request cancellation</ButtonPrimary>}
    />
  )
}

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
  const cancelOrder = useCancelOrder()

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
      .catch((e) => {
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
        <RequestCancellationModal onDismiss={onDismiss} onClick={onClick} summary={summary} shortId={shortId} />
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
  const isCancelling = status === ActivityStatus.CANCELLING
  const isCancelled = status === ActivityStatus.CANCELLED
  const isCancellable = isPending && type === ActivityType.ORDER

  const onCancelClick = () => setShowCancelModal(true)
  const onDismiss = () => setShowCancelModal(false)

  return (
    <>
      <TransactionState href={getEtherscanLink(chainId, id, 'transaction')}>
        <RowFixed>
          {activity && (
            <IconType color={determinePillColour(status, type)}>
              <IconWrapper pending={isPending || isCancelling} success={isConfirmed || isCancelled}>
                {isPending || isCancelling ? (
                  <Loader />
                ) : isConfirmed ? (
                  <SVG src={TxCheckImage} description="Order Confirmed" />
                ) : isExpired ? (
                  <SVG src={TxArrowsImage} description="Order Expired" />
                ) : isCancelled ? (
                  <SVG src={TxArrowsImage} description="Order Cancelled" />
                ) : (
                  <SVG src={TxArrowsImage} description="No state" />
                )}
              </IconWrapper>
            </IconType>
          )}
          <TransactionStatusText>
            {isCancelling ? (
              <MouseoverTooltip text={activity.summary || id}>
                {getActivitySummary({ activityData, id, suffix: '(Cancellation requested)', type })}
              </MouseoverTooltip>
            ) : (
              getActivitySummary({ activityData, id, type })
            )}
          </TransactionStatusText>
          <StatusLabel color={determinePillColour(status, type)}>
            {isPending
              ? 'Open'
              : isConfirmed
              ? 'Confirmed'
              : isExpired
              ? 'Expired'
              : isCancelled
              ? 'Cancelled'
              : 'No state'}
          </StatusLabel>
        </RowFixed>
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
    </>
  )
}
