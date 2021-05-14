import React, { useCallback, useContext } from 'react'
import { batch, useDispatch } from 'react-redux'
import { ThemeContext } from 'styled-components'
import { useActiveWeb3React } from 'hooks'
import { AppDispatch } from 'state'
import { clearAllTransactions } from 'state/transactions/actions'
import { getExplorerLabel, shortenAddress } from 'utils'
import { AutoRow } from 'components/Row'
import Copy from 'components/AccountDetails/Copy'

import { SUPPORTED_WALLETS } from 'constants/index'
import { getEtherscanLink } from 'utils'
import { injected, walletconnect, walletlink, fortmatic, portis } from 'connectors'
import CoinbaseWalletIcon from 'assets/images/coinbaseWalletIcon.svg'
import WalletConnectIcon from 'assets/images/walletConnectIcon.svg'
import FortmaticIcon from 'assets/images/fortmaticIcon.png'
import PortisIcon from 'assets/images/portisIcon.png'
import Identicon from 'components/Identicon'
import { ExternalLink as LinkIcon } from 'react-feather'
import { LinkStyledButton, TYPE } from 'theme'
import { clearOrders } from 'state/orders/actions'
import {
  WalletName,
  MainWalletAction,
  AccountDetailsProps,
  UpperSection,
  CloseIcon,
  CloseColor,
  HeaderRow,
  AccountSection,
  YourAccount,
  InfoCard,
  AccountGroupingRow,
  WalletAction,
  AccountControl,
  AddressLink,
  LowerSection,
  IconWrapper,
  renderTransactions
} from './AccountDetailsMod'
import { ConnectedWalletInfo, useWalletInfo } from 'hooks/useWalletInfo'
import { MouseoverTooltip } from 'components/Tooltip/TooltipMod'

type AbstractConnector = Pick<ReturnType<typeof useActiveWeb3React>, 'connector'>['connector']

export function formatConnectorName(connector?: AbstractConnector, walletInfo?: ConnectedWalletInfo) {
  const { ethereum } = window
  const { walletName } = walletInfo || {}
  const isMetaMask = !!(ethereum && ethereum.isMetaMask)
  const name =
    walletName ||
    Object.keys(SUPPORTED_WALLETS)
      .filter(
        k =>
          SUPPORTED_WALLETS[k].connector === connector && (connector !== injected || isMetaMask === (k === 'METAMASK'))
      )
      .map(k => SUPPORTED_WALLETS[k].name)[0]
  return <WalletName>Connected with {name}</WalletName>
}

export function getStatusIcon(connector?: AbstractConnector, walletInfo?: ConnectedWalletInfo) {
  if (walletInfo && !walletInfo.isSupportedWallet) {
    /* eslint-disable jsx-a11y/accessible-emoji */
    return (
      <MouseoverTooltip text="Wallet not currently supported">
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

export default function AccountDetails({
  toggleWalletModal,
  pendingTransactions,
  confirmedTransactions,
  ENSName,
  openOptions
}: AccountDetailsProps) {
  const { chainId, account, connector } = useActiveWeb3React()
  const walletInfo = useWalletInfo()
  const theme = useContext(ThemeContext)
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

  return (
    <>
      <UpperSection>
        <CloseIcon onClick={toggleWalletModal}>
          <CloseColor />
        </CloseIcon>
        <HeaderRow>Account</HeaderRow>
        <AccountSection>
          <YourAccount>
            <InfoCard>
              <AccountGroupingRow>
                {formatConnectorName(connector, walletInfo)}
                <div>
                  {connector !== injected && connector !== walletlink && (
                    <WalletAction
                      style={{ fontSize: '.825rem', fontWeight: 400, marginRight: '8px' }}
                      onClick={() => {
                        ;(connector as any).close()
                      }}
                    >
                      Disconnect
                    </WalletAction>
                  )}
                  <WalletAction
                    style={{ fontSize: '.825rem', fontWeight: 400 }}
                    onClick={() => {
                      openOptions()
                    }}
                  >
                    Change
                  </WalletAction>
                </div>
              </AccountGroupingRow>
              <AccountGroupingRow id="web3-account-identifier-row">
                <AccountControl>
                  {ENSName ? (
                    <>
                      <div>
                        {getStatusIcon(connector, walletInfo)}
                        <p> {ENSName}</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        {getStatusIcon(connector, walletInfo)}
                        <p> {account && shortenAddress(account)}</p>
                      </div>
                    </>
                  )}
                </AccountControl>
              </AccountGroupingRow>
              <AccountGroupingRow>
                {ENSName ? (
                  <>
                    <AccountControl>
                      <div>
                        {account && (
                          <Copy toCopy={account}>
                            <span style={{ marginLeft: '4px' }}>Copy Address</span>
                          </Copy>
                        )}
                        {chainId && account && (
                          <AddressLink
                            hasENS={!!ENSName}
                            isENS={true}
                            href={chainId && getEtherscanLink(chainId, ENSName, 'address')}
                          >
                            <LinkIcon size={16} />
                            <span style={{ marginLeft: '4px' }}>{explorerLabel}</span>
                          </AddressLink>
                        )}
                      </div>
                    </AccountControl>
                  </>
                ) : (
                  <>
                    <AccountControl>
                      <div>
                        {account && (
                          <Copy toCopy={account}>
                            <span style={{ marginLeft: '4px' }}>Copy Address</span>
                          </Copy>
                        )}
                        {chainId && account && (
                          <AddressLink
                            hasENS={!!ENSName}
                            isENS={false}
                            href={getEtherscanLink(chainId, account, 'address')}
                          >
                            <LinkIcon size={16} />
                            <span style={{ marginLeft: '4px' }}>{explorerLabel}</span>
                          </AddressLink>
                        )}
                      </div>
                    </AccountControl>
                  </>
                )}
              </AccountGroupingRow>
            </InfoCard>
          </YourAccount>
        </AccountSection>
      </UpperSection>
      {!!pendingTransactions.length || !!confirmedTransactions.length ? (
        <LowerSection>
          <AutoRow mb={'1rem'} style={{ justifyContent: 'space-between' }}>
            <TYPE.body>Recent Activity</TYPE.body>
            <LinkStyledButton onClick={clearAllActivityCallback}>(clear all)</LinkStyledButton>
          </AutoRow>
          {renderTransactions(pendingTransactions)}
          {renderTransactions(confirmedTransactions)}
        </LowerSection>
      ) : (
        <LowerSection>
          <TYPE.body color={theme.text1}>Your activity will appear here...</TYPE.body>
        </LowerSection>
      )}
    </>
  )
}
