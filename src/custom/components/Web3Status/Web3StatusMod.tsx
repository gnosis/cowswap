// eslint-disable-next-line no-restricted-imports
import { t, Trans } from '@lingui/macro'
import { AbstractConnector } from '@web3-react/abstract-connector'
import { UnsupportedChainIdError, useWeb3React } from '@web3-react/core'
import { darken, lighten } from 'polished'
// import { useMemo } from 'react'
import { Activity } from 'react-feather'
import styled, { css } from 'styled-components/macro'

// import CoinbaseWalletIcon from 'assets/images/coinbaseWalletIcon.svg'
// import FortmaticIcon from 'assets/images/fortmaticIcon.png'
// import PortisIcon from 'assets/images/portisIcon.png'
// import WalletConnectIcon from 'assets/images/walletConnectIcon.svg'
// import { fortmatic, injected, portis, walletconnect, walletlink } from 'connectors'
// import { NetworkContextName } from 'constants/index'
import useENSName from 'hooks/useENSName'
import { useHasSocks } from 'hooks/useSocksBalance'
import { useWalletModalToggle } from 'state/application/hooks'
// import { isTransactionRecent, useAllTransactions } from 'state/enhancedTransactions/hooks'
import { EnhancedTransactionDetails } from 'state/enhancedTransactions/reducer'
import { shortenAddress } from 'utils'
import { ButtonSecondary } from 'components/Button'

// import Identicon from 'components/Identicon'
import Loader from 'components/Loader'

import { RowBetween } from 'components/Row'
import { useEffect, useState } from 'react'
import { WAITING_TIME_RECONNECT_LAST_PROVIDER } from '@src/custom/constants'
// import WalletModal from 'components/WalletModal'

// const IconWrapper = styled.div<{ size?: number }>`
//   ${({ theme }) => theme.flexColumnNoWrap};
//   align-items: center;
//   justify-content: center;
//   & > * {
//     height: ${({ size }) => (size ? size + 'px' : '32px')};
//     width: ${({ size }) => (size ? size + 'px' : '32px')};
//   }
// `

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

export const Web3StatusConnected = styled(Web3StatusGeneric)<{ pending?: boolean; clickDisabled?: boolean }>`
  background-color: ${({ pending, theme }) => (pending ? theme.primary1 : theme.bg2)};
  border: 1px solid ${({ pending, theme }) => (pending ? theme.primary1 : theme.bg3)};
  color: ${({ pending, theme }) => (pending ? theme.white : theme.text1)};
  font-weight: 500;

  ${({ clickDisabled }) =>
    clickDisabled &&
    css`
      cursor: not-allowed;
    `}

  ${({ clickDisabled, pending }) =>
    !clickDisabled &&
    css`
      :hover,
      :focus {
        background-color: ${({ theme }) => (pending ? darken(0.05, theme.primary1) : lighten(0.05, theme.bg2))};

        :focus {
          border: 1px solid ${({ theme }) => (pending ? darken(0.1, theme.primary1) : darken(0.1, theme.bg3))};
        }
      }
    `}
`

export const Text = styled.p`
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
export function newTransactionsFirst(a: EnhancedTransactionDetails, b: EnhancedTransactionDetails) {
  return b.addedTime - a.addedTime
}

function Sock() {
  return (
    <span role="img" aria-label={t`has socks emoji`} style={{ marginTop: -4, marginBottom: -4 }}>
      🧦
    </span>
  )
}

// eslint-disable-next-line react/prop-types
/* 
function StatusIcon({ connector }: { connector: AbstractConnector }) {
  if (connector === injected) {
    return <Identicon />
  } else if (connector === walletconnect) {
    return (
      <IconWrapper size={16}>
        <img src={WalletConnectIcon} alt={'WalletConnect'} />
      </IconWrapper>
    )
  } else if (connector === walletlink) {
    return (
      <IconWrapper size={16}>
        <img src={CoinbaseWalletIcon} alt={'CoinbaseWallet'} />
      </IconWrapper>
    )
  } else if (connector === fortmatic) {
    return (
      <IconWrapper size={16}>
        <img src={FortmaticIcon} alt={'Fortmatic'} />
      </IconWrapper>
    )
  } else if (connector === portis) {
    return (
      <IconWrapper size={16}>
        <img src={PortisIcon} alt={'Portis'} />
      </IconWrapper>
    )
  }
  return null
}
*/

export function Web3StatusInner({
  pendingCount,
  StatusIconComponent,
  openOrdersPanel, // mod
  thereWasAProvider, //mod
}: {
  pendingCount?: number
  StatusIconComponent: (props: { connector: AbstractConnector }) => JSX.Element | null
  openOrdersPanel: () => void // mod
  thereWasAProvider: boolean //mod
}) {
  const { account, connector, error } = useWeb3React()

  const { ENSName } = useENSName(account ?? undefined)

  /* 
  const allTransactions = useAllTransactions()

  const sortedRecentTransactions = useMemo(() => {
    const txs = Object.values(allTransactions)
    return txs.filter(isTransactionRecent).sort(newTransactionsFirst)
  }, [allTransactions])

  const pending = sortedRecentTransactions.filter((tx) => !tx.receipt).map((tx) => tx.hash)

  const hasPendingTransactions = !!pending.length 
  */
  const hasPendingTransactions = !!pendingCount
  const hasSocks = useHasSocks()
  const toggleWalletModal = useWalletModalToggle()

  if (account) {
    return (
      <Web3StatusConnected
        id="web3-status-connected"
        // onClick={toggleWalletModal}
        onClick={openOrdersPanel} // mod
        pending={hasPendingTransactions}
      >
        {hasPendingTransactions ? (
          <RowBetween>
            <Text>
              {/* <Trans>{pending?.length} Pending</Trans> */}
              <Trans>{pendingCount} Pending</Trans>
            </Text>{' '}
            <Loader stroke="white" />
          </RowBetween>
        ) : (
          <>
            {hasSocks ? <Sock /> : null}
            <Text>{ENSName || shortenAddress(account)}</Text>
          </>
        )}
        {/* {!hasPendingTransactions && connector && <StatusIcon connector={connector} />} */}
        {!hasPendingTransactions && connector && <StatusIconComponent connector={connector} />}
      </Web3StatusConnected>
    )
  } else if (error) {
    return (
      <Web3StatusError onClick={toggleWalletModal}>
        <NetworkIcon />
        <Text>{error instanceof UnsupportedChainIdError ? <Trans>Wrong Network</Trans> : <Trans>Error</Trans>}</Text>
      </Web3StatusError>
    )
  } else if (thereWasAProvider) {
    return <ConnectingLabel pending />
  } else {
    return (
      <Web3StatusConnect id="connect-wallet" onClick={toggleWalletModal} faded={!account}>
        <Text>
          <Trans>Connect to a wallet</Trans>
        </Text>
      </Web3StatusConnect>
    )
  }
}

function ConnectingLabel({ pending }: { pending?: boolean }) {
  const [timeLeft, setTimeLeft] = useState(WAITING_TIME_RECONNECT_LAST_PROVIDER)
  const oneSec = 1000

  useEffect(() => {
    const id = setInterval(() => {
      setTimeLeft(timeLeft - oneSec)
    }, oneSec)

    return () => clearInterval(id)
  })

  return (
    <Web3StatusConnected pending={pending} clickDisabled={true}>
      <RowBetween>
        <Text>
          <Trans>Trying to connect</Trans>...{timeLeft / 1000}
        </Text>{' '}
        <Loader stroke="white" />
      </RowBetween>
    </Web3StatusConnected>
  )
}

/* export default function Web3Status() {
  const { active, account } = useWeb3React()
  const contextNetwork = useWeb3React(NetworkContextName)

  const { ENSName } = useENSName(account ?? undefined)

  const allTransactions = useAllTransactions()

  const sortedRecentTransactions = useMemo(() => {
    const txs = Object.values(allTransactions)
    return txs.filter(isTransactionRecent).sort(newTransactionsFirst)
  }, [allTransactions])

  const pending = sortedRecentTransactions.filter((tx) => !tx.receipt).map((tx) => tx.hash)
  const confirmed = sortedRecentTransactions.filter((tx) => tx.receipt).map((tx) => tx.hash)

  return (
    <>
      <Web3StatusInner />
      <WalletModal ENSName={ENSName ?? undefined} pendingTransactions={pending} confirmedTransactions={confirmed} />
    </>
  )
} */
