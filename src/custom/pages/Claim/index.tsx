/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect, useMemo } from 'react'
import { Trans } from '@lingui/macro'
import { useActiveWeb3React } from 'hooks/web3'
import { useUserAvailableClaims, useUserUnclaimedAmount, FREE_CLAIM_TYPES, ClaimType } from 'state/claim/hooks'
import { parseClaimAmount } from 'state/claim/hooks/utils'
import { ButtonPrimary, ButtonSecondary } from 'components/Button'
import { isAddress } from 'ethers/lib/utils'
import {
  ClaimTable,
  ClaimBreakdown,
  CheckAddress,
  PageWrapper,
  InputField,
  WalletButton,
  FooterNavButtons,
  EligibleBanner,
  CheckIcon,
  TopNav,
  ClaimAccount,
  ClaimSummary,
  ClaimTotal,
  ClaimSummaryTitle,
  InputErrorText,
} from 'pages/Claim/styled'
import { typeToCurrencyMapper, isFreeClaim, getFreeClaims, hasPaidClaim } from 'state/claim/hooks/utils'
import { useWalletModalToggle } from 'state/application/hooks'
import CowProtocolLogo from 'components/CowProtocolLogo'
import { TYPE } from 'theme'

export default function Claim() {
  const { account, chainId } = useActiveWeb3React()

  // account
  const [inputAddress, setInputAddress] = useState<string>('')
  const [activeClaimAccount, setActiveClaimAccount] = useState<string>('')

  // check address
  const [checkOpen, setCheckOpen] = useState<boolean>(false)
  const [isInputAddressValid, setIsInputAddressValid] = useState<boolean>(false)

  // claiming
  const [claimConfirmed, setClaimConfirmed] = useState<boolean>(false)
  const [claimAttempting, setClaimAttempting] = useState<boolean>(false)
  const [claimSubmitted, setClaimSubmitted] = useState<boolean>(false)

  // investment
  const [isInvestFlowActive, setIsInvestFlowActive] = useState<boolean>(false)

  // should be updated
  const dummyIdenticon =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAAAXNSR0IArs4c6QAAA4ZJREFUeF7t3b1xFUEQReF5Jpj4BCC5CoIgiIFoSEAOyoEsZJEAPiaYojAxtWerWlvzye/96T5zb8/MW83t8enuZQ3+fb2/Dd59/tZffoymf90AMAsBACjAKIEUYDT9a1EACjCKIAUYTT8FWGYBZgHDY3D29noAPcAogXqA0fTrAfQAVgItBU+KEAuYzP5iASyABbCASRFiAZPZfwsW8PB8P7sUNVyA3W9/A8DeCABg7/ovAABAD7AzAxRg5+qvxQI2rz8AAGAdYGsG9ABbl18PsHn5AQAAS8F7M6AH2Lv+poGb1x8AAIjrAPXDhm8//6QafP74LsXX4Onnr19W5R4AALMAA4ACJBGjACl9a7GA+LPm6QTG+gNAD6AHSIOIArRZjCZQE5gGoCYwpU8TmP/LFQtgAWkMWgls31aygIQfC2ABw3sZZgFmAUnDWEBKHwtgAbtbQBxAGaB6/+n46uH1+bMF1Aeoewn1/tPxAIi7idMFrPcHAAAqQymeBaT09WAKQAE6ReEKFCAk74xQCkABzuDo8DUowOHUnRNIASjAOSQdvAoFOJi4s8IoAAU4i6VD16EAh9J2XhAFoADn0XTgShTgQNLODKEAFOBMnl59rawA09u50yPo6u8PgFePmf8DADAs4RTg4t8FxAE4fuoYBaAAleEUXxVQD5DSP3/wIwCGTx9nASwgakgLpwAUIBGkB0jp0wOMf9lTJTDW//LvTwEiAZpATWBEqIVXBaQALf8s4OoSGOsPAAC8VIZSfLaAx6e70TeoL3B1AKef/waANADzbiQA4kredAKvrmAUoAkABYj5u3wCKUAk4OoJvPrzs4DNAQYAAKwDFAZYQMneWprA4c00FrA5wAAAgB6gMKAHKNnTA4xvJ7OAzQEGAABaD1CPfYv5X1c/NWz6/bMCAKCdHQyAmAEK0A6epAARwKsrIAAAoAksDFCAeGxaSf6/WD2AHqAylOIpAAVIANXgqoCawFgBCkABIkItnAJc/PTwVv7eBLOAWAEWwAIiQi2cBbCARBALSOlb6/IW8PB8n/4/QP06tybw16f3sYQt/MP33+kCVcLrbxLH/0cQANpSLgAoQFIgCpDStxYLiJ82sQAWkMagJvDiR8ZQAApAAUIGzALMAgI+a5kFpPSZBeSPG/UAeoA0Bs0CzAISQDXYQpCFoMSQzaD4gxIWwALSCKzBV7eAv6T9ww6D8p2HAAAAAElFTkSuQmCC'
  const activeClaimAccountENS = 'TestAccount.eth'

  // toggle wallet when disconnected
  const toggleWalletModal = useWalletModalToggle()

  // get user claim data
  const userClaimData = useUserAvailableClaims(activeClaimAccount)
  const sortedClaimData = useMemo(
    () => userClaimData.sort((a, b) => +FREE_CLAIM_TYPES.includes(b.type) - +FREE_CLAIM_TYPES.includes(a.type)),
    [userClaimData]
  )

  // get total unclaimed ammount
  const unclaimedAmount = useUserUnclaimedAmount(activeClaimAccount)

  const hasClaims = useMemo(() => userClaimData.length, [userClaimData])
  const isAirdropOnly = useMemo(() => !hasPaidClaim(userClaimData), [userClaimData])

  // handle table select change
  const [selected, setSelected] = useState<number[]>([])

  const handleSelect = (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const checked = event.target.checked
    const output = [...selected]
    checked ? output.push(index) : output.splice(output.indexOf(index), 1)
    setSelected(output)
  }

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    const checked = event.target.checked
    const all = userClaimData.map(({ index }) => index)
    const free = getFreeClaims(userClaimData).map(({ index }) => index)
    setSelected(checked ? all : free)
  }

  // handle change account
  const handleChangeAccount = () => {
    setActiveClaimAccount('')
    setCheckOpen(true)
  }

  // check claim
  const handleCheckClaim = () => {
    setActiveClaimAccount(inputAddress)
    setInputAddress('')
  }

  // handle submit claim
  const handleSubmitClaim = () => {
    if (isAirdropOnly) {
      console.log('claiming for', selected)
    } else {
      console.log('starting investment flow', selected)
      setIsInvestFlowActive(true)
    }
  }

  // on account change
  useEffect(() => {
    setActiveClaimAccount(account || '')
  }, [account])

  // I guess just for initial load
  useEffect(() => {
    if (!activeClaimAccount && account && !checkOpen) {
      setActiveClaimAccount(account)
    }
  }, [activeClaimAccount, account, checkOpen])

  // if wallet is disconnected
  useEffect(() => {
    if (!account && !checkOpen) {
      setActiveClaimAccount('')
    }
  }, [account, checkOpen])

  // handle address input
  useEffect(() => {
    setIsInputAddressValid(isAddress(inputAddress))
  }, [inputAddress])

  // set default selected options in state
  useEffect(() => {
    if (userClaimData.length) {
      setSelected(getFreeClaims(userClaimData).map(({ index }) => index))
    }
  }, [userClaimData])

  return (
    <PageWrapper>
      {(!claimAttempting || !claimConfirmed || !claimSubmitted) &&
        !!activeClaimAccount &&
        !!hasClaims &&
        !isInvestFlowActive && (
          <EligibleBanner>
            <CheckIcon />
            <Trans>This account is eligible for vCOW token claims!</Trans>
          </EligibleBanner>
        )}

      {!!activeClaimAccount && (
        <TopNav>
          <ClaimAccount hasENS={!!activeClaimAccountENS}>
            <div>
              <img src={dummyIdenticon} alt={activeClaimAccount} />
              <span>
                <p>{activeClaimAccountENS}</p>
                <p>{activeClaimAccount}</p>
              </span>
            </div>
            <ButtonSecondary onClick={handleChangeAccount}>Change account</ButtonSecondary>
          </ClaimAccount>
        </TopNav>
      )}

      {(!claimAttempting || !claimConfirmed || !claimSubmitted) && (
        <ClaimSummary>
          <CowProtocolLogo size={75} />
          {!activeClaimAccount && !hasClaims && (!claimAttempting || !claimConfirmed) && (
            <ClaimSummaryTitle>
              <Trans>
                Claim <b>vCOW</b> token
              </Trans>
            </ClaimSummaryTitle>
          )}
          {activeClaimAccount && (
            <div>
              <ClaimTotal>
                <b>Total available to claim</b>
                <p>{unclaimedAmount?.toFixed(0, { groupSeparator: ',' }) || 0} vCOW</p>
              </ClaimTotal>
            </div>
          )}
        </ClaimSummary>
      )}

      {!!hasClaims && (
        <ClaimBreakdown>
          <h2>vCOW claim breakdown</h2>
          <ClaimTable>
            <table>
              <thead>
                <tr>
                  <th>
                    <label className="checkAll">
                      <input onChange={handleSelectAll} type="checkbox" name="check" />
                    </label>
                  </th>
                  <th>Type of Claim</th>
                  <th>Amount</th>
                  <th>Price</th>
                  <th>Cost</th>
                  <th>Vesting</th>
                  <th>Ends in</th>
                </tr>
              </thead>
              <tbody>
                {sortedClaimData.map(({ index, type, amount }) => {
                  const isFree = isFreeClaim(type)
                  const currency = typeToCurrencyMapper(type, chainId)

                  return (
                    <tr key={index}>
                      <td>
                        {' '}
                        <label className="checkAll">
                          <input
                            onChange={(event) => handleSelect(event, index)}
                            type="checkbox"
                            name="check"
                            checked={isFree || selected.includes(index)}
                            disabled={isFree}
                          />
                        </label>
                      </td>
                      <td>{isFree ? type : `Buy vCOW with ${currency}`}</td>
                      <td width="150px">
                        <CowProtocolLogo size={16} />{' '}
                        {parseClaimAmount(amount, chainId)?.toFixed(0, { groupSeparator: ',' })} vCOW
                      </td>
                      <td>{isFree ? '-' : `16.66 vCoW per ${currency}`}</td>
                      <td>{isFree ? <span className="green">Free!</span> : `2,500.04 ${currency}`}</td>
                      <td>{type === ClaimType.Airdrop ? 'No' : '4 years (linear)'}</td>
                      <td>28 days, 10h, 50m</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </ClaimTable>
        </ClaimBreakdown>
      )}

      {(!activeClaimAccount || !hasClaims) && (
        <CheckAddress>
          <p>Enter an address to check for any eligible vCOW claims</p>
          {!account && (
            <p>
              <WalletButton onClick={toggleWalletModal}>
                <Trans>Connect Wallet</Trans>
              </WalletButton>
            </p>
          )}
          <InputField>
            <b>Input address</b>
            <input
              placeholder="Address or ENS name"
              value={inputAddress || ''}
              onChange={(e) => setInputAddress(e.currentTarget.value)}
            />
          </InputField>
          {!!inputAddress && !isInputAddressValid && (
            <InputErrorText>
              <TYPE.error error={true}>
                <Trans>Enter valid token address</Trans>
              </TYPE.error>
            </InputErrorText>
          )}
        </CheckAddress>
      )}

      <FooterNavButtons>
        {/* General claim vCOW button  (no invest) */}
        {!!activeClaimAccount && !!hasClaims && !claimConfirmed && !isInvestFlowActive && (
          <ButtonPrimary onClick={handleSubmitClaim}>
            <Trans>Claim vCOW</Trans>
          </ButtonPrimary>
        )}
        {/* Check for claims button */}
        {(!activeClaimAccount || !hasClaims) && (
          <ButtonPrimary disabled={!isInputAddressValid} type="text" onClick={handleCheckClaim}>
            <Trans>Check claimable vCOW</Trans>
          </ButtonPrimary>
        )}
      </FooterNavButtons>
    </PageWrapper>
  )
}
