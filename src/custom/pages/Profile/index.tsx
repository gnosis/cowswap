import { Txt } from 'assets/styles/styled'
import {
  FlexWrap,
  Wrapper,
  Container,
  GridWrap,
  CardHead,
  StyledTitle,
  StyledContainer,
  StyledTime,
  ItemTitle,
  ChildWrapper,
  Loader,
  ExtLink as ExternalLink,
  FlexRow,
} from 'pages/Profile/styled'
import { useActiveWeb3React } from 'hooks/web3'
import Copy from 'components/Copy/CopyMod'
import { ArrowUpRight, HelpCircle, RefreshCcw } from 'react-feather'
import Web3Status from 'components/Web3Status'
import useReferralLink from 'hooks/useReferralLink'
import useFetchProfile from 'hooks/useFetchProfile'
import { numberFormatter } from 'utils/format'
import { getExplorerAddressLink } from 'utils/explorer'
import useTimeAgo from 'hooks/useTimeAgo'
import { MouseoverTooltipContent } from 'components/Tooltip'
import NotificationBanner from 'components/NotificationBanner'
import { SupportedChainId as ChainId } from 'constants/chains'
import AffiliateStatusCheck from 'components/AffiliateStatusCheck'
import { useHasOrders } from 'api/gnosisProtocol/hooks'
import { shortenAddress } from '@src/utils'

export default function Profile() {
  const referralLink = useReferralLink()
  const { account, chainId } = useActiveWeb3React()
  const { profileData, isLoading, error } = useFetchProfile()
  const lastUpdated = useTimeAgo(profileData?.lastUpdated)
  const isTradesTooltipVisible = account && chainId == 1 && !!profileData?.totalTrades
  const hasOrders = useHasOrders(account)

  const renderNotificationMessages = (
    <>
      {error && (
        <NotificationBanner isVisible level="error" canClose={false}>
          There was an error loading your profile data. Please try again later.
        </NotificationBanner>
      )}
      {chainId && chainId !== ChainId.MAINNET && (
        <NotificationBanner isVisible level="info" canClose={false}>
          Profile data is only available for mainnet. Please change the network to see it.
        </NotificationBanner>
      )}
    </>
  )

  return (
    <Container>
      {chainId && chainId === ChainId.MAINNET && <AffiliateStatusCheck />}
      <Wrapper>
        <GridWrap>
          <CardHead>
            <FlexWrap col>
              <StyledTitle>Profile overview</StyledTitle>
              {account && (
                <Loader isLoading={isLoading}>
                  <StyledContainer>
                    <Txt>
                      <RefreshCcw size={16} />
                      &nbsp;&nbsp;
                      <Txt fs={14} secondary>
                        Last updated
                        <MouseoverTooltipContent content="Data is updated on the background periodically.">
                          <HelpCircle size={14} />
                        </MouseoverTooltipContent>
                        :&nbsp;
                      </Txt>
                      {!lastUpdated ? (
                        '-'
                      ) : (
                        <MouseoverTooltipContent content={<TimeFormatted date={profileData?.lastUpdated} />}>
                          <strong>{lastUpdated}</strong>
                        </MouseoverTooltipContent>
                      )}
                    </Txt>
                  </StyledContainer>
                </Loader>
              )}
            </FlexWrap>
            <FlexWrap col yAlign={'flex-end'}>
              {account && (
                <FlexRow>
                  <Txt fs={14}>
                    Reffered by:&nbsp;<strong>{shortenAddress(account)}</strong>
                  </Txt>
                  <span style={{ display: 'inline-block', verticalAlign: 'middle', marginLeft: 8 }}>
                    <Copy toCopy={account} />
                  </span>
                </FlexRow>
              )}
              <FlexWrap yAlign={'center'}>
                {hasOrders && account && (
                  <ExternalLink href={getExplorerAddressLink(chainId || 1, account)}>
                    <Txt fs={14}>View all orders </Txt>
                    <span style={{ lineHeight: 1, verticalAlign: 'middle', marginLeft: 8 }}>
                      <ArrowUpRight width={'16px'} height={'16px'} />
                    </span>
                  </ExternalLink>
                )}
              </FlexWrap>
            </FlexWrap>
          </CardHead>
          {renderNotificationMessages}
          <ChildWrapper>
            <Txt fs={16}>
              <strong>Your referral url</strong>
            </Txt>
            <Txt fs={14} center>
              {referralLink ? (
                <>
                  <span style={{ wordBreak: 'break-all', display: 'inline-block' }}>
                    {referralLink.prefix}
                    <strong>{referralLink.address}</strong>
                    <span style={{ display: 'inline-block', verticalAlign: 'middle', marginLeft: 8 }}>
                      <Copy toCopy={referralLink.link} />
                    </span>
                  </span>
                </>
              ) : (
                '-'
              )}
            </Txt>
          </ChildWrapper>
          <GridWrap horizontal>
            <ChildWrapper>
              <ItemTitle>
                Trades&nbsp;
                <MouseoverTooltipContent content="Statistics regarding your own trades.">
                  <HelpCircle size={14} />
                </MouseoverTooltipContent>
              </ItemTitle>
              <FlexWrap xAlign={'center'} className="item">
                <FlexWrap col yAlign={'center'}>
                  <span role="img" aria-label="farmer">
                    🧑‍🌾
                  </span>
                  <Loader isLoading={isLoading}>
                    <Txt fs={21}>
                      <strong>{formatInt(profileData?.totalTrades)}</strong>
                    </Txt>
                  </Loader>
                  <Loader isLoading={isLoading}>
                    <Txt secondary>
                      Total trades
                      {isTradesTooltipVisible && (
                        <MouseoverTooltipContent content="You may see more trades here than what you see in the activity list. To understand why, check out the FAQ.">
                          <HelpCircle size={14} />
                        </MouseoverTooltipContent>
                      )}
                    </Txt>
                  </Loader>
                </FlexWrap>
                <FlexWrap col yAlign={'center'}>
                  <span role="img" aria-label="moneybag">
                    💰
                  </span>
                  <Loader isLoading={isLoading}>
                    <strong>{formatDecimal(profileData?.tradeVolumeUsd)}</strong>
                  </Loader>
                  <Loader isLoading={isLoading}>
                    <span>Total traded volume</span>
                  </Loader>
                </FlexWrap>
              </FlexWrap>
            </ChildWrapper>
            <ChildWrapper>
              <ItemTitle>
                Referrals&nbsp;
                <MouseoverTooltipContent content="Statistics regarding trades by people who used your referral link.">
                  <HelpCircle size={14} />
                </MouseoverTooltipContent>
              </ItemTitle>
              <FlexWrap className="item">
                <FlexWrap yAlign={'center'} col>
                  <span role="img" aria-label="handshake">
                    🤝
                  </span>
                  <Loader isLoading={isLoading}>
                    <strong>{formatInt(profileData?.totalReferrals)}</strong>
                  </Loader>
                  <Loader isLoading={isLoading}>
                    <span>Total referrals</span>
                  </Loader>
                </FlexWrap>
                <FlexWrap yAlign={'center'} col>
                  <span role="img" aria-label="wingedmoney">
                    💸
                  </span>
                  <Loader isLoading={isLoading}>
                    <strong>{formatDecimal(profileData?.referralVolumeUsd)}</strong>
                  </Loader>
                  <Loader isLoading={isLoading}>
                    <span>Referrals volume</span>
                  </Loader>
                </FlexWrap>
              </FlexWrap>
            </ChildWrapper>
          </GridWrap>
          {!account && <Web3Status openOrdersPanel={() => console.log('TODO')} />}
        </GridWrap>
      </Wrapper>
    </Container>
  )
}

interface TimeProps {
  date: string | undefined
}

const TimeFormatted = ({ date }: TimeProps) => {
  if (!date) return null

  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ]
  const _date = new Date(date)
  const monthName = months[_date.getMonth()]
  const hours = _date.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })

  return <StyledTime>{`${_date.getDate()} ${monthName} ${_date.getFullYear()} - ${hours}`}</StyledTime>
}

const formatDecimal = (number?: number): string => {
  return number ? numberFormatter.format(number) : '-'
}

const formatInt = (number?: number): string => {
  return number ? number.toLocaleString() : '-'
}
