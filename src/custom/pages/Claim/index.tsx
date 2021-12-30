/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect, useMemo, useCallback, Fragment } from 'react'
import { Trans } from '@lingui/macro'
import { useActiveWeb3React } from 'hooks/web3'
import { ExternalLink, CustomLightSpinner } from 'theme'
import { useUserAvailableClaims, useUserUnclaimedAmount, FREE_CLAIM_TYPES, ClaimType } from 'state/claim/hooks'
import { ButtonPrimary, ButtonSecondary } from 'components/Button'
import Circle from 'assets/images/blue-loader.svg'
import {
  PageWrapper,
  ConfirmOrLoadingWrapper,
  ConfirmedIcon,
  AttemptFooter,
  CheckIcon,
  ClaimSummary,
  ClaimTotal,
  IntroDescription,
  ClaimTable,
  ClaimAccount,
  EligibleBanner,
  InputField,
  InputError,
  CheckAddress,
  ClaimBreakdown,
  FooterNavButtons,
  TopNav,
  InvestFlow,
  InvestContent,
  InvestTokenGroup,
  InvestInput,
  InvestAvailableBar,
  InvestSummary,
  InvestFlowValidation,
  InvestTokenSubtotal,
  StepIndicator,
  Steps,
  TokenLogo,
  ClaimSummaryTitle,
  InputErrorText,
  WalletButton,
  InputFieldTitle,
} from 'pages/Claim/styled'
import {
  getTypeToCurrencyMap,
  getTypeToPriceMap,
  isFreeClaim,
  getFreeClaims,
  hasPaidClaim,
  parseClaimAmount,
} from 'state/claim/hooks/utils'
import { useWalletModalToggle } from 'state/application/hooks'
import CowProtocolLogo from 'components/CowProtocolLogo'
import Confetti from 'components/Confetti'
import { shortenAddress } from 'utils'
import { isAddress } from 'web3-utils'
import useENS from 'hooks/useENS'
import { TYPE } from 'theme'

export default function Claim() {
  const { account, chainId } = useActiveWeb3React()

  // address/ens address
  const [inputAddress, setInputAddress] = useState<string>('')

  const { loading, address: resolvedAddress, name: resolvedENS } = useENS(inputAddress)
  const isInputAddressValid = useMemo(() => isAddress(resolvedAddress || ''), [resolvedAddress])

  // Show input error
  const showInputError = useMemo(
    () => Boolean(inputAddress.length > 0 && !loading && !resolvedAddress),
    [resolvedAddress, inputAddress, loading]
  )

  // account
  const [activeClaimAccount, setActiveClaimAccount] = useState<string>('')
  const [activeClaimAccountENS, setActiveClaimAccountENS] = useState<string>('')

  // check address
  const [checkOpen, setCheckOpen] = useState<boolean>(false)

  // claiming
  const [claimConfirmed, setClaimConfirmed] = useState<boolean>(false)
  const [claimAttempting, setClaimAttempting] = useState<boolean>(false)
  const [claimSubmitted, setClaimSubmitted] = useState<boolean>(false)

  // investment
  const [isInvestFlowActive, setIsInvestFlowActive] = useState<boolean>(false)

  // should be updated
  const dummyIdenticon =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAAAXNSR0IArs4c6QAAA4ZJREFUeF7t3b1xFUEQReF5Jpj4BCC5CoIgiIFoSEAOyoEsZJEAPiaYojAxtWerWlvzye/96T5zb8/MW83t8enuZQ3+fb2/Dd59/tZffoymf90AMAsBACjAKIEUYDT9a1EACjCKIAUYTT8FWGYBZgHDY3D29noAPcAogXqA0fTrAfQAVgItBU+KEAuYzP5iASyABbCASRFiAZPZfwsW8PB8P7sUNVyA3W9/A8DeCABg7/ovAABAD7AzAxRg5+qvxQI2rz8AAGAdYGsG9ABbl18PsHn5AQAAS8F7M6AH2Lv+poGb1x8AAIjrAPXDhm8//6QafP74LsXX4Onnr19W5R4AALMAA4ACJBGjACl9a7GA+LPm6QTG+gNAD6AHSIOIArRZjCZQE5gGoCYwpU8TmP/LFQtgAWkMWgls31aygIQfC2ABw3sZZgFmAUnDWEBKHwtgAbtbQBxAGaB6/+n46uH1+bMF1Aeoewn1/tPxAIi7idMFrPcHAAAqQymeBaT09WAKQAE6ReEKFCAk74xQCkABzuDo8DUowOHUnRNIASjAOSQdvAoFOJi4s8IoAAU4i6VD16EAh9J2XhAFoADn0XTgShTgQNLODKEAFOBMnl59rawA09u50yPo6u8PgFePmf8DADAs4RTg4t8FxAE4fuoYBaAAleEUXxVQD5DSP3/wIwCGTx9nASwgakgLpwAUIBGkB0jp0wOMf9lTJTDW//LvTwEiAZpATWBEqIVXBaQALf8s4OoSGOsPAAC8VIZSfLaAx6e70TeoL3B1AKef/waANADzbiQA4kredAKvrmAUoAkABYj5u3wCKUAk4OoJvPrzs4DNAQYAAKwDFAZYQMneWprA4c00FrA5wAAAgB6gMKAHKNnTA4xvJ7OAzQEGAABaD1CPfYv5X1c/NWz6/bMCAKCdHQyAmAEK0A6epAARwKsrIAAAoAksDFCAeGxaSf6/WD2AHqAylOIpAAVIANXgqoCawFgBCkABIkItnAJc/PTwVv7eBLOAWAEWwAIiQi2cBbCARBALSOlb6/IW8PB8n/4/QP06tybw16f3sYQt/MP33+kCVcLrbxLH/0cQANpSLgAoQFIgCpDStxYLiJ82sQAWkMagJvDiR8ZQAApAAUIGzALMAgI+a5kFpPSZBeSPG/UAeoA0Bs0CzAISQDXYQpCFoMSQzaD4gxIWwALSCKzBV7eAv6T9ww6D8p2HAAAAAElFTkSuQmCC'

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

  // claim type to currency and price map
  const typeToCurrencyMap = useMemo(() => getTypeToCurrencyMap(chainId), [chainId])
  const typeToPriceMap = useMemo(() => getTypeToPriceMap(), [])

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

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.target.value
    const withoutSpaces = input.replace(/\s+/g, '')
    setInputAddress(withoutSpaces)
  }

  // handle change account
  const handleChangeAccount = () => {
    setActiveClaimAccount('')
    setCheckOpen(true)
  }

  // check claim
  const handleCheckClaim = () => {
    setActiveClaimAccount(resolvedAddress || '')
    setActiveClaimAccountENS(resolvedENS || '')
    setInputAddress('')
  }

  // handle submit claim
  const handleSubmitClaim = () => {
    if (isAirdropOnly) {
      console.log('claiming for', selected)
    } else {
      console.log('starting investment flow', selected)
      // setIsInvestFlowActive(true)
    }
  }

  // on account change
  useEffect(() => {
    setActiveClaimAccount(account || '')
  }, [account])

  // if wallet is disconnected
  useEffect(() => {
    if (!account && !checkOpen) {
      setActiveClaimAccount('')
    }
  }, [account, checkOpen])

  // set default selected options in state
  useEffect(() => {
    if (userClaimData.length) {
      setSelected(getFreeClaims(userClaimData).map(({ index }) => index))
    }
  }, [userClaimData])

  return (
    <PageWrapper>
      {/* If claim is confirmed > trigger confetti effect */}
      <Confetti start={claimConfirmed} />
      {/* START -- Top nav buttons */}
      {!!activeClaimAccount && (
        <TopNav>
          <ClaimAccount>
            <div>
              <img src={dummyIdenticon} alt={activeClaimAccount} />
              <p>{activeClaimAccountENS ? activeClaimAccountENS : shortenAddress(activeClaimAccount)}</p>
            </div>
            <ButtonSecondary disabled={claimAttempting} onClick={handleChangeAccount}>
              Change account
            </ButtonSecondary>
          </ClaimAccount>
        </TopNav>
      )}
      {/* END -- Top nav buttons */}

      {/* START - Show general title OR total to claim (user has airdrop or airdrop+investment) --------------------------- */}
      {(!claimAttempting || !claimConfirmed || !claimSubmitted) &&
        !!activeClaimAccount &&
        !!hasClaims &&
        !isInvestFlowActive && (
          <EligibleBanner>
            <CheckIcon />
            <Trans>This account is eligible for vCOW token claims!</Trans>
          </EligibleBanner>
        )}
      {(!claimAttempting || !claimConfirmed || !claimSubmitted) && !isInvestFlowActive && (
        <ClaimSummary>
          <CowProtocolLogo size={100} />
          {!activeClaimAccount && !hasClaims && (
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
      {/* END - Show total to claim (user has airdrop or airdrop+investment) --------------------------- */}

      {/* START - Get address/ENS (user not connected yet or opted for checking 'another' account) */}
      {!activeClaimAccount && !claimConfirmed && (
        <CheckAddress>
          <p>
            Enter an address to check for any eligible vCOW claims. <br />
            <i>Note: It is possible to claim for an account, using any wallet/account.</i>
            {!account && (
              <ButtonSecondary onClick={toggleWalletModal}>
                <Trans>or connect a wallet</Trans>
              </ButtonSecondary>
            )}
          </p>

          <InputField>
            <InputFieldTitle>
              <b>Input address</b>
              {loading && <CustomLightSpinner src={Circle} alt="loader" size={'10px'} />}
            </InputFieldTitle>
            <input placeholder="Address or ENS name" value={inputAddress} onChange={handleInputChange} />
          </InputField>

          {showInputError && (
            <InputErrorText>
              <TYPE.error error={true}>
                <Trans>Enter valid token address or ENS</Trans>
              </TYPE.error>
            </InputErrorText>
          )}
        </CheckAddress>
      )}
      {/* END - Get address/ENS (user not connected yet or opted for checking 'another' account) */}

      {/* START -- IS Airdrop only (simple)  ----------------------------------------------------- */}
      {!!activeClaimAccount && !!hasClaims && !!isAirdropOnly && !claimAttempting && !claimConfirmed && (
        <IntroDescription>
          <p>
            <Trans>
              Thank you for being a supporter of CowSwap and the CoW protocol. As an important member of the CowSwap
              Community you may claim vCOW to be used for voting and governance. You can claim your tokens until{' '}
              <i>[XX-XX-XXXX - XX:XX GMT]</i>
              <ExternalLink href="https://cow.fi/">Read more about vCOW</ExternalLink>
            </Trans>
          </p>
        </IntroDescription>
      )}
      {/* END -- IS Airdrop only (simple)  ---------------------------------------- */}

      {/* START -- NO CLAIMS  ----------------------------------------------------- */}
      {!!activeClaimAccount && !hasClaims && !claimAttempting && !claimConfirmed && (
        <IntroDescription>
          <Trans>
            Unfortunately this account is not eligible for any vCOW claims.{' '}
            <ButtonSecondary onClick={() => setActiveClaimAccount('')}>Try another account</ButtonSecondary> or
            <ExternalLink href="https://cow.fi/">read more about vCOW</ExternalLink>
          </Trans>
        </IntroDescription>
      )}
      {/* END ---- NO CLAIMS  ----------------------------------------------------- */}

      {/* START - Try claiming or inform succesfull claim  ---------------------- */}
      {activeClaimAccount && (claimAttempting || claimConfirmed) && (
        <ConfirmOrLoadingWrapper activeBG={true}>
          <ConfirmedIcon>
            {!claimConfirmed ? (
              <CustomLightSpinner src={Circle} alt="loader" size={'90px'} />
            ) : (
              <CowProtocolLogo size={100} />
            )}
          </ConfirmedIcon>
          <h3>{claimConfirmed ? 'Claimed!' : 'Claiming'}</h3>
          {!claimConfirmed && (
            <p>
              <Trans>{unclaimedAmount?.toFixed(0, { groupSeparator: ',' }) || 0} vCOW</Trans>
            </p>
          )}

          {claimConfirmed && (
            <>
              <Trans>
                <h3>You have successfully claimed</h3>
              </Trans>
              <Trans>
                <p>[CLAIMED AMOUNT] vCOW</p>
              </Trans>
              <Trans>
                <span role="img" aria-label="party-hat">
                  🎉🐮{' '}
                </span>
                Welcome to the COWmunnity! :){' '}
                <span role="img" aria-label="party-hat">
                  🐄🎉
                </span>
              </Trans>
            </>
          )}
          {claimAttempting && !claimSubmitted && (
            <AttemptFooter>
              <p>
                <Trans>Confirm this transaction in your wallet</Trans>
              </p>
            </AttemptFooter>
          )}
          {claimAttempting && claimSubmitted && !claimConfirmed && chainId && (
            // && claimTxn?.hash
            <ExternalLink
              // href={getExplorerLink(chainId, claimTxn?.hash, ExplorerDataType.TRANSACTION)}
              href="#"
              style={{ zIndex: 99 }}
            >
              <Trans>View transaction on Explorer</Trans>
            </ExternalLink>
          )}
        </ConfirmOrLoadingWrapper>
      )}
      {/* END -- Try claiming or inform succesfull claim  ----------------------------------------------------- */}

      {/* START -- IS Airdrop + investing (advanced)  ----------------------------------------------------- */}
      {!!activeClaimAccount &&
        !isAirdropOnly &&
        !!hasClaims &&
        !isInvestFlowActive &&
        !(claimAttempting || claimConfirmed) && (
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
                    const currency = typeToCurrencyMap[type] || ''
                    const vCowPrice = typeToPriceMap[type]
                    const parsedAmount = parseClaimAmount(amount, chainId)
                    const cost = vCowPrice * Number(parsedAmount?.toSignificant(6))

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
                          <CowProtocolLogo size={16} /> {parsedAmount?.toFixed(0, { groupSeparator: ',' })} vCOW
                        </td>
                        <td>{isFree ? '-' : `${vCowPrice} vCoW per ${currency}`}</td>
                        <td>{isFree ? <span className="green">Free!</span> : `${cost} ${currency}`}</td>
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
      {/* END -- IS Airdrop + investing (advanced)  ----------------------------------------------------- */}

      <FooterNavButtons>
        {/* General claim vCOW button  (no invest) */}
        {!!activeClaimAccount && !!hasClaims && !isInvestFlowActive && !claimAttempting && !claimConfirmed && (
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
