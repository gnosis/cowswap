import React, { useCallback } from 'react'
import { batch, useDispatch } from 'react-redux'

import { useActiveWeb3React } from 'hooks/web3'
import { AppDispatch } from 'state'
import { clearAllTransactions } from 'state/transactions/actions'
import { getExplorerLabel, shortenAddress } from 'utils'

import Copy from 'components/AccountDetails/Copy'
import { Trans } from '@lingui/macro'

import { SUPPORTED_WALLETS } from 'constants/index'
import { getEtherscanLink } from 'utils'
import { injected, walletconnect, walletlink, fortmatic, portis, WalletProvider } from 'connectors'
import CoinbaseWalletIcon from 'assets/images/coinbaseWalletIcon.svg'
import WalletConnectIcon from 'assets/images/walletConnectIcon.svg'
import FortmaticIcon from 'assets/images/fortmaticIcon.png'
import PortisIcon from 'assets/images/portisIcon.png'
import Identicon from 'components/Identicon'
import { ExternalLink as LinkIcon } from 'react-feather'
import { LinkStyledButton } from 'theme'
import { clearOrders } from 'state/orders/actions'
import {
  WalletName,
  MainWalletAction,
  WalletAction,
  AccountControl,
  AddressLink,
  IconWrapper,
  renderTransactions,
} from './AccountDetailsMod'
import {
  Wrapper,
  InfoCard,
  AccountGroupingRow,
  NoActivityMessage,
  LowerSection,
  WalletActions,
  WalletLowerActions,
  WalletNameAddress,
} from './styled'
import { ConnectedWalletInfo, useWalletInfo } from 'hooks/useWalletInfo'
import { MouseoverTooltip } from 'components/Tooltip'

type AbstractConnector = Pick<ReturnType<typeof useActiveWeb3React>, 'connector'>['connector']

function getWalletName(connector?: AbstractConnector): string {
  const { ethereum } = window
  const isMetaMask = !!(ethereum && ethereum.isMetaMask)

  const walletTuple = Object.entries(SUPPORTED_WALLETS).filter(
    ([walletType, { connector: walletConnector }]) =>
      walletConnector === connector && (connector !== injected || isMetaMask === (walletType === 'METAMASK'))
  )
  return walletTuple[0]?.[1]?.name || 'Unknown wallet'
}

export function formatConnectorName(connector?: AbstractConnector, walletInfo?: ConnectedWalletInfo) {
  const name = walletInfo?.walletName || getWalletName(connector)
  // In case the wallet is connected via WalletConnect and has wallet name set, add the suffix to be clear
  // This to avoid confusion for instance when using Metamask mobile
  // When name is not set, it defaults to WalletConnect already
  const walletConnectSuffix =
    walletInfo?.provider === WalletProvider.WALLET_CONNECT && walletInfo?.walletName ? ' (via WalletConnect)' : ''

  return (
    <WalletName>
      Connected with {name}
      {walletConnectSuffix}
    </WalletName>
  )
}

export function getStatusIcon(connector?: AbstractConnector, walletInfo?: ConnectedWalletInfo) {
  if (walletInfo && !walletInfo.isSupportedWallet) {
    /* eslint-disable jsx-a11y/accessible-emoji */
    return (
      <MouseoverTooltip text="This wallet is not yet supported">
        <IconWrapper role="img" aria-label="Warning sign. Wallet not supported">
          ⚠️
        </IconWrapper>
      </MouseoverTooltip>
    )
    /* eslint-enable jsx-a11y/accessible-emoji */
  } else if (walletInfo?.icon) {
    return (
      <IconWrapper size={16}>
        <img src={walletInfo.icon} alt={`${walletInfo?.walletName || 'wallet'} logo`} />
      </IconWrapper>
    )
  } else if (connector === injected) {
    return (
      <IconWrapper size={16}>
        <Identicon />
      </IconWrapper>
    )
  } else if (connector === walletconnect) {
    return (
      <IconWrapper size={16}>
        <img src={WalletConnectIcon} alt={'wallet connect logo'} />
      </IconWrapper>
    )
  } else if (connector === walletlink) {
    return (
      <IconWrapper size={16}>
        <img src={CoinbaseWalletIcon} alt={'coinbase wallet logo'} />
      </IconWrapper>
    )
  } else if (connector === fortmatic) {
    return (
      <IconWrapper size={16}>
        <img src={FortmaticIcon} alt={'fortmatic logo'} />
      </IconWrapper>
    )
  } else if (connector === portis) {
    return (
      <>
        <IconWrapper size={16}>
          <img src={PortisIcon} alt={'portis logo'} />
          <MainWalletAction
            onClick={() => {
              portis.portis.showPortis()
            }}
          >
            Show Portis
          </MainWalletAction>
        </IconWrapper>
      </>
    )
  }
  return null
}

interface AccountDetailsProps {
  pendingTransactions: string[]
  confirmedTransactions: string[]
  ENSName?: string
  toggleWalletModal: () => void
}

export default function AccountDetails({
  pendingTransactions,
  confirmedTransactions,
  ENSName,
  toggleWalletModal,
}: AccountDetailsProps) {
  const { chainId, account, connector } = useActiveWeb3React()
  const walletInfo = useWalletInfo()
  // const theme = useContext(ThemeContext)
  const dispatch = useDispatch<AppDispatch>()

  const clearAllActivityCallback = useCallback(() => {
    if (chainId) {
      batch(() => {
        dispatch(clearAllTransactions({ chainId }))
        dispatch(clearOrders({ chainId }))
      })
    }
  }, [dispatch, chainId])
  const explorerLabel = chainId && account ? getExplorerLabel(chainId, account, 'address') : undefined
  const activityTotalCount = (pendingTransactions?.length || 0) + (confirmedTransactions?.length || 0)

  return (
    <Wrapper>
      <InfoCard>
        <AccountGroupingRow id="web3-account-identifier-row">
          <AccountControl>
            {ENSName ? (
              <>
                <div>
                  {getStatusIcon(connector, walletInfo)}
                  <WalletNameAddress> {ENSName}</WalletNameAddress>
                </div>
              </>
            ) : (
              <>
                <div>
                  {getStatusIcon(connector, walletInfo)}
                  <WalletNameAddress> {account && shortenAddress(account)}</WalletNameAddress>
                </div>
              </>
            )}
            <WalletActions>
              {formatConnectorName(connector, walletInfo)}
              <div>
                {connector !== injected && connector !== walletlink && (
                  <WalletAction
                    style={{ fontSize: '.825rem', fontWeight: 400, marginRight: '8px' }}
                    onClick={() => {
                      ;(connector as any).close()
                    }}
                  >
                    <Trans>Disconnect</Trans>
                  </WalletAction>
                )}
                <WalletAction style={{ fontSize: '.825rem', fontWeight: 400 }} onClick={toggleWalletModal}>
                  <Trans>Change</Trans>
                </WalletAction>
              </div>
            </WalletActions>
          </AccountControl>
        </AccountGroupingRow>
        <AccountGroupingRow>
          {ENSName ? (
            <>
              <AccountControl>
                <WalletLowerActions>
                  {account && (
                    <Copy toCopy={account}>
                      <span style={{ marginLeft: '4px' }}>Copy Address</span>
                    </Copy>
                  )}
                  {chainId && account && (
                    <AddressLink hasENS={!!ENSName} isENS={true} href={getEtherscanLink(chainId, ENSName, 'address')}>
                      <LinkIcon size={16} />
                      <span style={{ marginLeft: '4px' }}>{explorerLabel}</span>
                    </AddressLink>
                  )}
                </WalletLowerActions>
              </AccountControl>
            </>
          ) : (
            <>
              <AccountControl>
                <WalletLowerActions>
                  {account && (
                    <Copy toCopy={account}>
                      <span style={{ marginLeft: '4px' }}>Copy Address</span>
                    </Copy>
                  )}
                  {chainId && account && (
                    <AddressLink hasENS={!!ENSName} isENS={false} href={getEtherscanLink(chainId, account, 'address')}>
                      <LinkIcon size={16} />
                      <span style={{ marginLeft: '4px' }}>{explorerLabel}</span>
                    </AddressLink>
                  )}
                </WalletLowerActions>
              </AccountControl>
            </>
          )}
        </AccountGroupingRow>
      </InfoCard>

      {!!pendingTransactions.length || !!confirmedTransactions.length ? (
        <LowerSection>
          <span>
            {' '}
            <h5>
              Recent Activity <span>{`(${activityTotalCount})`}</span>
            </h5>
            <LinkStyledButton onClick={clearAllActivityCallback}>Clear activity</LinkStyledButton>
          </span>

          <div>
            {renderTransactions(pendingTransactions)}
            {renderTransactions(confirmedTransactions)}
          </div>
        </LowerSection>
      ) : (
        <LowerSection>
          <NoActivityMessage>Your activity will appear here...</NoActivityMessage>
        </LowerSection>
      )}
    </Wrapper>
  )
}
