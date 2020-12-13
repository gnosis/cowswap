import { Order } from '@src/custom/state/orders/actions'
import { usePendingOrders } from '@src/custom/state/orders/hooks'
import { AbstractConnector } from '@web3-react/abstract-connector'
import { UnsupportedChainIdError, useWeb3React } from '@web3-react/core'
import { darken, lighten } from 'polished'
import React, { useMemo } from 'react'
import { Activity } from 'react-feather'
import { useTranslation } from 'react-i18next'
import styled, { css } from 'styled-components'
import CoinbaseWalletIcon from '@src/assets/images/coinbaseWalletIcon.svg'
import FortmaticIcon from '@src/assets/images/fortmaticIcon.png'
import PortisIcon from '@src/assets/images/portisIcon.png'
import WalletConnectIcon from '@src/assets/images/walletConnectIcon.svg'
import { fortmatic, injected, portis, walletconnect, walletlink } from '@src/connectors'
import { NetworkContextName } from '../../constants'
import useENSName from 'hooks/useENSName'
import { useHasSocks } from 'hooks/useSocksBalance'
import { useWalletModalToggle } from '@src/state/application/hooks'
import { isTransactionRecent, useAllTransactions } from '@src/state/transactions/hooks'
import { TransactionDetails } from '@src/state/transactions/reducer'
import { shortenAddress } from '@src/utils'
import { ButtonSecondary } from '../Button'

import Identicon from '@src/components/Identicon'
import Loader from '@src/components/Loader'

import { RowBetween } from '@src/components/Row'
import WalletModal from 'components/WalletModal'

const IconWrapper = styled.div<{ size?: number }>`
  ${({ theme }) => theme.flexColumnNoWrap};
  align-items: center;
  justify-content: center;
  & > * {
    height: ${({ size }) => (size ? size + 'px' : '32px')};
    width: ${({ size }) => (size ? size + 'px' : '32px')};
  }
`

const Web3StatusGeneric = styled(ButtonSecondary)`
  ${({ theme }) => theme.flexRowNoWrap}
  width: 100%;
  align-items: center;
  padding: 0.5rem;
  border-radius: 12px;
  cursor: pointer;
  user-select: none;
  :focus {
    outline: none;
  }
`
const Web3StatusError = styled(Web3StatusGeneric)`
  background-color: ${({ theme }) => theme.red1};
  border: 1px solid ${({ theme }) => theme.red1};
  color: ${({ theme }) => theme.white};
  font-weight: 500;
  :hover,
  :focus {
    background-color: ${({ theme }) => darken(0.1, theme.red1)};
  }
`

const Web3StatusConnect = styled(Web3StatusGeneric)<{ faded?: boolean }>`
  background-color: ${({ theme }) => theme.primary4};
  border: none;
  color: ${({ theme }) => theme.primaryText1};
  font-weight: 500;

  :hover,
  :focus {
    border: 1px solid ${({ theme }) => darken(0.05, theme.primary4)};
    color: ${({ theme }) => theme.primaryText1};
  }

  ${({ faded }) =>
    faded &&
    css`
      background-color: ${({ theme }) => theme.primary5};
      border: 1px solid ${({ theme }) => theme.primary5};
      color: ${({ theme }) => theme.primaryText1};

      :hover,
      :focus {
        border: 1px solid ${({ theme }) => darken(0.05, theme.primary4)};
        color: ${({ theme }) => darken(0.05, theme.primaryText1)};
      }
    `}
`

const Web3StatusConnected = styled(Web3StatusGeneric)<{ pending?: boolean }>`
  background-color: ${({ pending, theme }) => (pending ? theme.primary1 : theme.bg2)};
  border: 1px solid ${({ pending, theme }) => (pending ? theme.primary1 : theme.bg3)};
  color: ${({ pending, theme }) => (pending ? theme.white : theme.text1)};
  font-weight: 500;
  :hover,
  :focus {
    background-color: ${({ pending, theme }) => (pending ? darken(0.05, theme.primary1) : lighten(0.05, theme.bg2))};

    :focus {
      border: 1px solid ${({ pending, theme }) => (pending ? darken(0.1, theme.primary1) : darken(0.1, theme.bg3))};
    }
  }
`

const Text = styled.p`
  flex: 1 1 auto;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin: 0 0.5rem 0 0.25rem;
  font-size: 1rem;
  width: fit-content;
  font-weight: 500;
`

const NetworkIcon = styled(Activity)`
  margin-left: 0.25rem;
  margin-right: 0.5rem;
  width: 16px;
  height: 16px;
`

// we want the latest one to come first, so return negative if a is after b
function newTransactionsFirst(a: TransactionDetails, b: TransactionDetails) {
  return b.addedTime - a.addedTime
}

const SOCK = (
  <span role="img" aria-label="has socks emoji" style={{ marginTop: -4, marginBottom: -4 }}>
    🧦
  </span>
)

// eslint-disable-next-line react/prop-types
function StatusIcon({ connector }: { connector: AbstractConnector }) {
  if (connector === injected) {
    return <Identicon />
  } else if (connector === walletconnect) {
    return (
      <IconWrapper size={16}>
        <img src={WalletConnectIcon} alt={''} />
      </IconWrapper>
    )
  } else if (connector === walletlink) {
    return (
      <IconWrapper size={16}>
        <img src={CoinbaseWalletIcon} alt={''} />
      </IconWrapper>
    )
  } else if (connector === fortmatic) {
    return (
      <IconWrapper size={16}>
        <img src={FortmaticIcon} alt={''} />
      </IconWrapper>
    )
  } else if (connector === portis) {
    return (
      <IconWrapper size={16}>
        <img src={PortisIcon} alt={''} />
      </IconWrapper>
    )
  }
  return null
}

function newPendingOrdersFirst(a: Order, b: Order): number {
  return Date.parse(b.creationTime) - Date.parse(a.creationTime)
}

function Web3StatusInner() {
  const { t } = useTranslation()
  const { account, connector, error, chainId } = useWeb3React()

  const { ENSName } = useENSName(account ?? undefined)

  const allTransactions = useAllTransactions()
  const pendingOrders = usePendingOrders({ chainId }).map(order => order.id)

  const [sortedRecentTransactions, sortedPendingOrders] = useMemo(() => {
    const txs = Object.values(allTransactions)
    return [txs.filter(isTransactionRecent).sort(newTransactionsFirst), pendingOrders]
  }, [allTransactions, pendingOrders])

  const pending = sortedRecentTransactions
    .filter(tx => !tx.receipt)
    .map(tx => tx.hash)
    .concat(sortedPendingOrders)

  const hasPendingTransactions = !!pending.length
  const hasSocks = useHasSocks()
  const toggleWalletModal = useWalletModalToggle()

  if (account) {
    return (
      <Web3StatusConnected id="web3-status-connected" onClick={toggleWalletModal} pending={hasPendingTransactions}>
        {hasPendingTransactions ? (
          <RowBetween>
            <Text>{pending?.length} Pending</Text> <Loader stroke="white" />
          </RowBetween>
        ) : (
          <>
            {hasSocks ? SOCK : null}
            <Text>{ENSName || shortenAddress(account)}</Text>
          </>
        )}
        {!hasPendingTransactions && connector && <StatusIcon connector={connector} />}
      </Web3StatusConnected>
    )
  } else if (error) {
    return (
      <Web3StatusError onClick={toggleWalletModal}>
        <NetworkIcon />
        <Text>{error instanceof UnsupportedChainIdError ? 'Wrong Network' : 'Error'}</Text>
      </Web3StatusError>
    )
  } else {
    return (
      <Web3StatusConnect id="connect-wallet" onClick={toggleWalletModal} faded={!account}>
        <Text>{t('Connect to a wallet')}</Text>
      </Web3StatusConnect>
    )
  }
}

export default function Web3Status() {
  const { active, account, chainId } = useWeb3React()
  const contextNetwork = useWeb3React(NetworkContextName)

  const { ENSName } = useENSName(account ?? undefined)

  const allTransactions = useAllTransactions()
  const pendingOrders = usePendingOrders({ chainId })

  const [sortedRecentTransactions, sortedPendingOrders] = useMemo(() => {
    const txs = Object.values(allTransactions)
    return [txs.filter(isTransactionRecent).sort(newTransactionsFirst), pendingOrders.sort(newPendingOrdersFirst)]
  }, [allTransactions, pendingOrders])

  const pending = sortedRecentTransactions.filter(tx => !tx.receipt).map(tx => tx.hash)
  const confirmed = sortedRecentTransactions.filter(tx => tx.receipt).map(tx => tx.hash)

  if (!contextNetwork.active && !active) {
    return null
  }

  return (
    <>
      <Web3StatusInner />
      <WalletModal
        ENSName={ENSName ?? undefined}
        // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
        // @ts-ignore
        pendingOrders={sortedPendingOrders}
        pendingTransactions={pending}
        confirmedTransactions={confirmed}
      />
    </>
  )
}
