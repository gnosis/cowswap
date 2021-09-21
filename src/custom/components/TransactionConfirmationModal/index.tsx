import { Currency } from '@uniswap/sdk-core'
import { useActiveWeb3React } from 'hooks/web3'
import { useWalletInfo } from 'hooks/useWalletInfo'
import { SupportedChainId as ChainId } from 'constants/chains'
import React, { ReactNode, useContext } from 'react'
import styled, { ThemeContext } from 'styled-components'
import {
  CloseIcon,
  // CustomLightSpinner
} from 'theme'
import { Trans } from '@lingui/macro'
import { ExternalLink } from 'theme'
import { RowBetween, RowFixed } from 'components/Row'
import MetaMaskLogo from 'assets/images/metamask.png'
import { getEtherscanLink, getExplorerLabel } from 'utils'
import { Text } from 'rebass'
import { ArrowUpCircle, CheckCircle, UserCheck } from 'react-feather'
import useAddTokenToMetamask from 'hooks/useAddTokenToMetamask'
import GameIcon from 'assets/cow-swap/game.gif'
import { Link } from 'react-router-dom'
import { ConfirmationModalContent as ConfirmationModalContentMod } from './TransactionConfirmationModalMod'
import { ColumnCenter } from 'components/Column'
// import { lighten } from 'polished'
import { getStatusIcon } from 'components/AccountDetails'

const Wrapper = styled.div`
  width: 100%;

  @keyframes spinner {
    0% {
      transform: rotate(0);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`

const Section = styled.div`
  padding: 24px;
  align-items: center;
  justify-content: flex-start;
  display: flex;
  flex-flow: column wrap;
`

const CloseIconWrapper = styled(CloseIcon)`
  display: flex;
  margin: 16px 16px 0 auto;
  opacity: 0.75;
  transition: opacity 0.2s ease-in-out;

  &:hover {
    opacity: 1;
  }
`

const IconSpinner = styled.div`
  margin: 0 auto 21px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 74px;
  height: 74px;
  ${({ theme }) => theme.neumorphism.boxShadow}
  border-radius: 74px;

  > div {
    height: 100%;
    width: 100%;
    position: relative;
    background: transparent;
  }

  > div > div {
    animation: spinner 2s linear 0.8s infinite;
  }

  > div > div > svg {
    height: 100%;
    width: 100%;
  }
`

const CloseLink = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.primary1};
  cursor: pointer;
  margin: 8px auto;
`

export const GPModalHeader = styled(RowBetween)`
  ${({ theme }) => theme.mediaWidth.upToSmall`
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    padding: 16px;
    background: ${({ theme }) => theme.bg1};
    z-index: 20;
  `}
`

const InternalLink = styled(Link)``

const StyledIcon = styled.img`
  height: auto;
  width: 20px;
  max-height: 100%;
  margin: 0 10px 0 0;
`

const ExternalLinkCustom = styled(ExternalLink)`
  margin: 12px auto 48px;
`

const ButtonGroup = styled.div`
  display: grid;
  align-items: center;
  justify-content: center;
  flex-flow: column wrap;
  margin: 12px 0 24px;
  width: 100%;
`

const ButtonCustom = styled.button`
  display: flex;
  flex: 1 1 auto;
  align-self: center;
  justify-content: center;
  align-items: center;
  border-radius: 16px;
  min-height: 52px;
  border: 1px solid ${({ theme }) => theme.border2};
  color: ${({ theme }) => theme.text1};
  background: transparent;
  outline: 0;
  padding: 8px 16px;
  margin: 16px 0 0;
  font-size: 14px;
  line-height: 1;
  font-weight: 500;
  transition: background 0.2s ease-in-out;
  cursor: pointer;

  &:hover {
    background: ${({ theme }) => theme.border2};
  }

  > a {
    display: flex;
    align-items: center;
    color: inherit;
    text-decoration: none;
  }
`

const CheckCircleCustom = styled(CheckCircle)`
  height: auto;
  width: 20px;
  max-height: 100%;
  margin: 0 10px 0 0;
`

const ConfirmedIcon = styled(ColumnCenter)`
  padding: 16px 0 32px;
`

const UpperSection = styled.div`
  display: flex;
  flex-flow: column wrap;
  padding: 16px 0;
`

const LowerSection = styled.div`
  display: flex;
  flex-flow: column wrap;
  background: ${({ theme }) => theme.bg4};
  padding: 40px;
  margin: 16px auto 0;

  > h3 {
    text-align: center;
    width: 100%;
    font-size: 21px;
  }
`

const StepsWrapper = styled.div`
  display: flex;
  flex-flow: row wrap;
  justify-content: space-between;
  position: relative;

  > div {
    flex: 0 1 35%;
    display: flex;
    flex-flow: column wrap;
    animation: SlideInStep 1s forwards linear;
    opacity: 0;
    transform: translateX(-5px);
  }

  > div:hover {
    opacity: 1;
  }

  > div:last-of-type {
    animation-delay: 0.75s;
  }

  > hr {
    flex: 1 1 auto;
    height: 2px;
    border: 0;
    background: linear-gradient(to left, ${({ theme }) => theme.bg1} 20%, ${({ theme }) => theme.bg4} 0%) repeat-x top /
      12px 2px;
    margin: auto;
    position: absolute;
    width: 100%;
    max-width: 156px;
    left: 0;
    right: 0;
    top: 38px;
  }

  > hr::before {
    content: '';
    height: 4px;
    width: 100%;
    background: ${({ theme }) => theme.bg4};
    display: block;
    margin: 0;
    animation: Shrink 1s forwards linear;
    transform: translateX(0%);
  }

  > div > p {
    font-size: 13px;
    line-height: 1.4;
    text-align: center;
  }

  @keyframes SlideInStep {
    from {
      opacity: 0;
      transform: translateX(-5px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes Shrink {
    from {
      transform: translateX(0%);
    }
    to {
      transform: translateX(100%);
    }
  }
`

const StepsIconWraper = styled.div`
  border-radius: 75px;
  height: 75px;
  width: 75px;
  margin: 0 auto 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  ${({ theme }) => theme.neumorphism.boxShadowEmbossed}

  > svg {
    height: 100%;
    width: 100%;
    padding: 22px;
    stroke: ${({ theme }) => theme.text1};
  }
`

export * from './TransactionConfirmationModalMod'
export { default } from './TransactionConfirmationModalMod'

export function ConfirmationPendingContent({
  onDismiss,
  pendingText,
}: {
  onDismiss: () => void
  pendingText: ReactNode
}) {
  const { connector } = useActiveWeb3React()
  const walletInfo = useWalletInfo()

  enum walletType {
    SAFE,
    SC,
    EOA,
  }
  const WalletName = walletType.SAFE ? 'Gnosis Safe' : walletType.SC ? 'smart contract wallet' : 'wallet'
  console.log(walletInfo)

  return (
    <Wrapper>
      <UpperSection>
        <CloseIconWrapper onClick={onDismiss} />

        <IconSpinner>{getStatusIcon(connector, walletInfo)}</IconSpinner>

        <Text fontWeight={500} fontSize={16} color="" textAlign="center">
          {pendingText}
        </Text>
      </UpperSection>

      <LowerSection>
        <h3>
          <Trans>Almost there!</Trans>
        </h3>

        <StepsWrapper>
          <div>
            <StepsIconWraper>
              <UserCheck />
            </StepsIconWraper>
            <p>
              <Trans>1. Sign and submit the order with your {WalletName}.</Trans>
            </p>
          </div>
          <hr />
          <div>
            <StepsIconWraper>
              <CheckCircle />
            </StepsIconWraper>
            <p>
              <Trans>2. The order is then submitted and ready to be settled.</Trans>
            </p>
          </div>
        </StepsWrapper>
      </LowerSection>
    </Wrapper>
  )
}

export function TransactionSubmittedContent({
  onDismiss,
  chainId,
  hash,
  currencyToAdd,
}: {
  onDismiss: () => void
  hash: string | undefined
  chainId: ChainId
  currencyToAdd?: Currency | undefined
}) {
  const theme = useContext(ThemeContext)
  const { library } = useActiveWeb3React()
  const { addToken, success } = useAddTokenToMetamask(currencyToAdd)

  return (
    <Wrapper>
      <Section>
        <CloseIconWrapper onClick={onDismiss} />

        <ConfirmedIcon>
          <ArrowUpCircle strokeWidth={0.5} size={90} color={theme.primary1} />
        </ConfirmedIcon>

        <Text fontWeight={500} fontSize={20}>
          Transaction Submitted
        </Text>

        {chainId && hash && (
          <ExternalLinkCustom href={getEtherscanLink(chainId, hash, 'transaction')}>
            <Text fontWeight={500} fontSize={14} color={theme.primary1}>
              {getExplorerLabel(chainId, hash, 'transaction')} ↗
            </Text>
          </ExternalLinkCustom>
        )}

        <ButtonGroup>
          {currencyToAdd && library?.provider?.isMetaMask && (
            <ButtonCustom onClick={addToken}>
              {!success ? (
                <RowFixed>
                  <StyledIcon src={MetaMaskLogo} /> Add {currencyToAdd.symbol} to Metamask
                </RowFixed>
              ) : (
                <RowFixed>
                  <CheckCircleCustom size={'16px'} stroke={theme.green1} />
                  Added {currencyToAdd.symbol}{' '}
                </RowFixed>
              )}
            </ButtonCustom>
          )}

          <ButtonCustom>
            <InternalLink to="/play" onClick={onDismiss}>
              <StyledIcon src={GameIcon} alt="Play CowGame" />
              Play the CowGame!
            </InternalLink>
          </ButtonCustom>
        </ButtonGroup>

        <CloseLink onClick={onDismiss}>Close</CloseLink>
      </Section>
    </Wrapper>
  )
}

export interface ConfirmationModalContentProps {
  title: ReactNode
  onDismiss: () => void
  topContent: () => ReactNode
  bottomContent?: () => ReactNode | undefined
}

export function ConfirmationModalContent(props: ConfirmationModalContentProps) {
  return <ConfirmationModalContentMod {...props} />
}
