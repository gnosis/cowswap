import { useEffect, useMemo, useCallback } from 'react'
import { Trans } from '@lingui/macro'
import { useActiveWeb3React } from 'hooks/web3'
import {
  useUserAvailableParsedClaims,
  useUserUnclaimedAmount,
  useClaimCallback,
  useInvestmentStillAvailable,
  useAirdropStillAvailable,
  ClaimInput,
} from 'state/claim/hooks'
import { ButtonPrimary, ButtonSecondary } from 'components/Button'
import { PageWrapper, FooterNavButtons } from 'pages/Claim/styled'
import EligibleBanner from './EligibleBanner'
import { getFreeClaims, hasPaidClaim, getIndexes, getPaidClaims } from 'state/claim/hooks/utils'
import { useWalletModalToggle } from 'state/application/hooks'
import Confetti from 'components/Confetti'
import { isAddress } from 'web3-utils'
import useENS from 'hooks/useENS'
import ClaimNav from './ClaimNav'
import ClaimSummary from './ClaimSummary'
import ClaimAddress from './ClaimAddress'
import CanUserClaimMessage from './CanUserClaimMessage'
import { useClaimDispatchers, useClaimState } from 'state/claim/hooks'
import { ClaimStatus } from 'state/claim/actions'
import ClaimingStatus from './ClaimingStatus'
import ClaimsTable from './ClaimsTable'
import InvestmentFlow from './InvestmentFlow'

export default function Claim() {
  const { account } = useActiveWeb3React()
  // Maintains state, updates Context Provider below
  // useClaimReducer should only be used here, in nested components use "useClaimState"

  const {
    // address/ENS address
    inputAddress,
    // account
    activeClaimAccount,
    // check address
    isSearchUsed,
    // claiming
    claimStatus,
    // investment
    isInvestFlowActive,
    investFlowStep,
    // table select change
    selected,
  } = useClaimState()

  const {
    // account
    setInputAddress,
    setActiveClaimAccount,
    setActiveClaimAccountENS,
    // search
    setIsSearchUsed,
    // claiming
    setClaimStatus,
    // setClaimedAmount, // TODO: uncomment when used
    // investing
    setIsInvestFlowActive,
    setInvestFlowStep,
    // claim row selection
    setSelected,
    setSelectedAll,
  } = useClaimDispatchers()

  const { address: resolvedAddress, name: resolvedENS } = useENS(inputAddress)
  const isInputAddressValid = useMemo(() => isAddress(resolvedAddress || ''), [resolvedAddress])

  // toggle wallet when disconnected
  const toggleWalletModal = useWalletModalToggle()

  // get user claim data
  const userClaimData = useUserAvailableParsedClaims(activeClaimAccount)

  // get total unclaimed ammount
  const unclaimedAmount = useUserUnclaimedAmount(activeClaimAccount)

  const hasClaims = useMemo(() => userClaimData.length > 0, [userClaimData])
  const isAirdropOnly = useMemo(() => !hasPaidClaim(userClaimData), [userClaimData])

  // checks regarding investment time window
  const isInvestmentStillAvailable = useInvestmentStillAvailable()
  const isAirdropStillAvailable = useAirdropStillAvailable()

  // claim callback
  const { claimCallback } = useClaimCallback(activeClaimAccount)

  const handleSelect = (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const checked = event.target.checked
    const output = [...selected]
    checked ? output.push(index) : output.splice(output.indexOf(index), 1)
    setSelected(output)

    if (!checked) {
      setSelectedAll(false)
    }
  }

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    const checked = event.target.checked
    const paid = getIndexes(getPaidClaims(userClaimData))
    setSelected(checked ? paid : [])
    setSelectedAll(checked)
  }

  // handle change account
  const handleChangeAccount = () => {
    setActiveClaimAccount('')
    setSelected([])
    setClaimStatus(ClaimStatus.DEFAULT)
    setIsSearchUsed(true)
  }

  // check claim
  const handleCheckClaim = () => {
    setActiveClaimAccount(resolvedAddress || '')
    setActiveClaimAccountENS(resolvedENS || '')
    setInputAddress('')
  }

  const handleClaiming = useCallback(
    (inputData: ClaimInput[]) => {
      setClaimStatus(ClaimStatus.ATTEMPTING)

      if (inputData) {
        claimCallback(inputData)
          .then((res) => {
            setClaimStatus(ClaimStatus.SUBMITTED)
            console.log(`Transaction ${res} submitted`)
          })
          .catch((error) => {
            setClaimStatus(ClaimStatus.DEFAULT)
            console.log(error)
          })
      }
    },
    [claimCallback, setClaimStatus]
  )

  // handle submit claim
  const handleSubmitClaim = () => {
    // just to be sure
    if (!activeClaimAccount) return

    const freeClaims = getFreeClaims(userClaimData)

    // check if there are any selected (paid) claims
    if (!selected.length) {
      const inputData = freeClaims.map(({ index }) => ({ index }))

      console.log('Starting claiming with', inputData)

      handleClaiming(inputData)
    } else {
      setIsInvestFlowActive(true)
    }
  }

  console.log(
    `Claim/index::`,
    `[unclaimedAmount ${unclaimedAmount?.toFixed(2)}]`,
    `[hasClaims ${hasClaims}]`,
    `[activeClaimAccount ${activeClaimAccount}]`,
    `[isAirdropOnly ${isAirdropOnly}]`,
    `[isInvestmentStillAvailable ${isInvestmentStillAvailable}]`,
    `[isAirdropStillAvailable ${isAirdropStillAvailable}]`
  )

  // on account change
  useEffect(() => {
    if (!isSearchUsed && account) {
      setActiveClaimAccount(account)
    }

    if (!account) {
      setActiveClaimAccount('')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account])

  // if wallet is disconnected
  useEffect(() => {
    if (!account && !isSearchUsed) {
      setActiveClaimAccount('')
    }

    if (!account) {
      setIsInvestFlowActive(false)
      setInvestFlowStep(0)
    }
    // setActiveClaimAccount and other dispatch fns are only here for TS. They are safe references.
  }, [account, isSearchUsed, setActiveClaimAccount, setInvestFlowStep, setIsInvestFlowActive])

  return (
    <PageWrapper>
      {/* If claim is confirmed > trigger confetti effect */}
      <Confetti start={claimStatus === ClaimStatus.CONFIRMED} />

      {/* Top nav buttons */}
      <ClaimNav account={account} handleChangeAccount={handleChangeAccount} />
      {/* Show general title OR total to claim (user has airdrop or airdrop+investment) */}
      <EligibleBanner hasClaims={hasClaims} />
      {/* Show total to claim (user has airdrop or airdrop+investment) */}
      <ClaimSummary hasClaims={hasClaims} unclaimedAmount={unclaimedAmount} />
      {/* Get address/ENS (user not connected yet or opted for checking 'another' account) */}
      <ClaimAddress account={account} toggleWalletModal={toggleWalletModal} />
      {/* Is Airdrop only (simple) - does user have claims? Show messages dependent on claim state */}
      <CanUserClaimMessage hasClaims={hasClaims} isAirdropOnly={isAirdropOnly} />
      {/* Try claiming or inform succesfull claim */}
      <ClaimingStatus />
      {/* IS Airdrop + investing (advanced) */}
      <ClaimsTable
        isAirdropOnly={isAirdropOnly}
        userClaimData={userClaimData}
        handleSelect={handleSelect}
        handleSelectAll={handleSelectAll}
        hasClaims={hasClaims}
      />
      {/* Investing vCOW flow (advanced) */}
      <InvestmentFlow isAirdropOnly={isAirdropOnly} hasClaims={hasClaims} userClaimData={userClaimData} />

      <FooterNavButtons>
        {/* General claim vCOW button  (no invest) */}
        {!!activeClaimAccount && !!hasClaims && !isInvestFlowActive && claimStatus === ClaimStatus.DEFAULT ? (
          account ? (
            <ButtonPrimary onClick={handleSubmitClaim}>
              <Trans>Claim vCOW</Trans>
            </ButtonPrimary>
          ) : (
            <ButtonPrimary onClick={toggleWalletModal}>
              <Trans>Connect a wallet</Trans>
            </ButtonPrimary>
          )
        ) : null}

        {/* Check for claims button */}
        {(!activeClaimAccount || !hasClaims) && (
          <ButtonPrimary disabled={!isInputAddressValid} type="text" onClick={handleCheckClaim}>
            <Trans>Check claimable vCOW</Trans>
          </ButtonPrimary>
        )}

        {/* Invest flow button */}
        {!!activeClaimAccount &&
          !!hasClaims &&
          claimStatus === ClaimStatus.DEFAULT &&
          !isAirdropOnly &&
          !!isInvestFlowActive && (
            <>
              {investFlowStep === 0 ? (
                <ButtonPrimary onClick={() => setInvestFlowStep(1)}>
                  <Trans>Approve tokens</Trans>
                </ButtonPrimary>
              ) : investFlowStep === 1 ? (
                <ButtonPrimary onClick={() => setInvestFlowStep(2)}>
                  <Trans>Review</Trans>
                </ButtonPrimary>
              ) : (
                <ButtonPrimary onClick={() => setInvestFlowStep(3)}>
                  <Trans>Claim and invest vCOW</Trans>
                </ButtonPrimary>
              )}

              <ButtonSecondary
                onClick={() =>
                  investFlowStep === 0 ? setIsInvestFlowActive(false) : setInvestFlowStep(investFlowStep - 1)
                }
              >
                <Trans>Go back</Trans>
              </ButtonSecondary>
            </>
          )}
      </FooterNavButtons>
    </PageWrapper>
  )
}
