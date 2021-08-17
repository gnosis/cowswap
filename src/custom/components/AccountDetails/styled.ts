import styled from 'styled-components'
import { CopyIcon } from 'components/AccountDetails/Copy'
import { LinkStyledButton } from 'theme'
import { NetworkCard as NetworkCardUni } from 'components/Header/HeaderMod'
import {
  WalletName,
  AccountSection as AccountSectionMod,
  AccountGroupingRow as AccountGroupingRowMod,
  UpperSection as UpperSectionMod,
  AddressLink,
  TransactionListWrapper,
} from './AccountDetailsMod'

export const Wrapper = styled.div`
  display: flex;
  flex-flow: row wrap;
  width: 100%;
  color: ${({ theme }) => theme.text1};
  padding: 0;
  height: 100%;

  ${({ theme }) => theme.mediaWidth.upToMedium`padding: 42px 0 0;`};

  ${WalletName},
  ${AddressLink},
  ${CopyIcon} {
    color: ${({ theme }) => theme.text1};
    opacity: 0.7;
    transition: color 0.2s ease-in-out, opacity 0.2s ease-in-out;

    &:not(${WalletName}):hover {
      opacity: 1;
      text-decoration: underline;
    }
  }

  ${TransactionListWrapper} {
    padding: 0;
    width: 100%;
    flex-flow: column wrap;
  }
`

export const NetworkCard = styled(NetworkCardUni)`
  background-color: ${({ theme }) => theme.networkCard.background};
  color: ${({ theme }) => theme.networkCard.text};
  padding: 6px 8px;
  font-size: 13px;
  margin: 0 8px 0 0;
  letter-spacing: 0.7px;
`

export const UpperSection = styled(UpperSectionMod)`
  flex: 1 1 auto;
  width: 100%;
`

export const InfoCard = styled.div`
  width: 100%;
  display: flex;
  flex-flow: column wrap;
  margin: 0;
  border-radius: 0;
  padding: 16px 16px 24px;
`

export const AccountSection = styled(AccountSectionMod)`
  padding: 0;
  ${({ theme }) => theme.mediaWidth.upToMedium`padding: 0;`};
`

export const AccountGroupingRow = styled(AccountGroupingRowMod)`
  > div {
    flex-flow: column wrap;
    justify-content: flex-start;
    align-items: center;
  }
`

export const NoActivityMessage = styled.p`
  font-size: 14px;
  color: ${({ theme }) => theme.text1};
  width: 100%;
  padding: 24px 0 0;
  text-align: center;
  display: flex;
  justify-content: center;
`

export const LowerSection = styled.div`
  background-color: ${({ theme }) => theme.bg2};
  border-radius: 0;
  height: 100%;
  width: 100%;
  align-items: flex-start;
  justify-content: flex-start;

  > span {
    display: flex;
    justify-content: space-between;
    padding: 8px 16px;
    border-bottom: 1px solid #d9e8ef;
    position: sticky;
    top: 38px;
    background: rgb(255 255 255 / 60%);
    backdrop-filter: blur(5px);
    z-index: 10;
    ${({ theme }) => theme.mediaWidth.upToMedium`
      top: 42px;
    `};
  }

  > div {
    display: flex;
    flex-flow: column wrap;
    padding: 0;
    width: 100%;
    background-color: ${({ theme }) => theme.bg2};
    padding: 0 0 100px;
  }

  h5 {
    margin: 0;
    font-weight: 500;
    color: ${({ theme }) => theme.text2};
    line-height: 1;
    display: flex;
    align-items: center;
    > span {
      opacity: 0.6;
      margin: 0 0 0 4px;
    }
  }

  ${LinkStyledButton} {
    text-decoration: underline;
  }
`

export const WalletActions = styled.div`
  display: flex;
  margin: 10px 0 0;
`

export const WalletLowerActions = styled.div`
  width: 100%;
  padding: 12px;
  border-radius: 21px;
  justify-content: space-evenly;
  ${({ theme }) => theme.neumorphism.boxShadow}
  margin: 16px 0 0;
`

export const WalletNameAddress = styled.div`
  width: 100%;
  font-size: 21px;
`
