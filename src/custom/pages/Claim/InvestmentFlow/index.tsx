import { useEffect, useMemo } from 'react'
import {
  InvestFlow,
  InvestContent,
  InvestFlowValidation,
  InvestTokenSubtotal,
  StepIndicator,
  Steps,
  ClaimTable,
  AccountClaimSummary,
} from 'pages/Claim/styled'
import { InvestSummaryRow } from 'pages/Claim/InvestmentFlow/InvestSummaryRow'
import { ClaimType, useClaimState, useUserEnhancedClaimData, useClaimDispatchers } from 'state/claim/hooks'
import { ClaimCommonTypes, ClaimWithInvestmentData, EnhancedUserClaimData } from '../types'
import { ClaimStatus } from 'state/claim/actions'
import { useActiveWeb3React } from 'hooks/web3'
import { ApprovalState, OptionalApproveCallbackParams } from 'hooks/useApproveCallback'
import InvestOption from './InvestOption'
import { calculateInvestmentAmounts } from 'state/claim/hooks/utils'

export type InvestOptionProps = {
  claim: EnhancedUserClaimData
  optionIndex: number
  approveData:
    | { approveState: ApprovalState; approveCallback: (optionalParams?: OptionalApproveCallbackParams) => void }
    | undefined
}

type InvestmentFlowProps = Pick<ClaimCommonTypes, 'hasClaims'> & {
  isAirdropOnly: boolean
  gnoApproveData: InvestOptionProps['approveData']
  usdcApproveData: InvestOptionProps['approveData']
}

type TokenApproveName = 'gnoApproveData' | 'usdcApproveData'
type TokenApproveData = {
  [key in TokenApproveName]: InvestOptionProps['approveData'] | undefined
}

// map claim type to token approve data
function _claimToTokenApproveData(claimType: ClaimType, tokenApproveData: TokenApproveData) {
  switch (claimType) {
    case ClaimType.GnoOption:
      return tokenApproveData.gnoApproveData
    case ClaimType.Investor:
      return tokenApproveData.usdcApproveData
    default:
      return undefined
  }
}

export default function InvestmentFlow({ hasClaims, isAirdropOnly, ...tokenApproveData }: InvestmentFlowProps) {
  const { account } = useActiveWeb3React()
  const { selected, activeClaimAccount, claimStatus, isInvestFlowActive, investFlowStep, investFlowData } =
    useClaimState()
  const { initInvestFlowData } = useClaimDispatchers()
  const claimData = useUserEnhancedClaimData(activeClaimAccount)

  // filtering and splitting claims into free and selected paid claims
  const [_freeClaims, _paidClaims] = useMemo(() => {
    const paid: EnhancedUserClaimData[] = []
    const free: EnhancedUserClaimData[] = []

    claimData.forEach((claim) => {
      if (claim.isFree) {
        free.push(claim)
      } else if (selected.includes(claim.index)) {
        paid.push(claim)
      }
    })
    return [free, paid]
  }, [claimData, selected])

  // Adding investment data for free claims
  const freeClaims = useMemo(
    () => _freeClaims.map<ClaimWithInvestmentData>((claim) => ({ ...claim, ...calculateInvestmentAmounts(claim) })),
    [_freeClaims]
  )

  // Adding investment data for paid claims
  // It's separated from free claims because this depends on `investmentFlowData`, while free claims do not
  const paidClaims = useMemo(
    () =>
      _paidClaims.map<ClaimWithInvestmentData>((claim) => {
        const investmentAmount = investFlowData.find(({ index }) => index === claim.index)?.investedAmount

        return { ...claim, ...calculateInvestmentAmounts(claim, investmentAmount) }
      }),
    [_paidClaims, investFlowData]
  )

  const allClaims = useMemo(() => freeClaims.concat(paidClaims), [freeClaims, paidClaims])
  useEffect(() => {
    initInvestFlowData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInvestFlowActive])

  if (
    !activeClaimAccount || // no connected account
    !hasClaims || // no claims
    !isInvestFlowActive || // not on correct step (account change in mid step)
    claimStatus !== ClaimStatus.DEFAULT || // not in default claim state
    isAirdropOnly // is only for airdrop
  ) {
    return null
  }

  return (
    <InvestFlow>
      <StepIndicator>
        <Steps step={investFlowStep}>
          <li>Allowances: Approve all tokens to be used for investment.</li>
          <li>Submit and confirm the transaction to claim vCOW</li>
        </Steps>
        <h1>
          {investFlowStep === 0
            ? 'Claiming vCOW is a two step process'
            : investFlowStep === 1
            ? 'Set allowance to Buy vCOW'
            : 'Confirm transaction to claim all vCOW'}
        </h1>
      </StepIndicator>

      {/* Invest flow: Step 1 > Set allowances and investment amounts */}
      {investFlowStep === 1 ? (
        <InvestContent>
          <p>
            Your account can participate in the investment of vCOW. Each investment opportunity will allow you to invest
            up to a predefined maximum amount of tokens{' '}
          </p>

          {paidClaims.map((claim, index) => (
            <InvestOption
              key={claim.index}
              optionIndex={index}
              approveData={_claimToTokenApproveData(claim.type, tokenApproveData)}
              claim={claim}
            />
          ))}

          {/* TODO: Update this with real data */}
          <InvestTokenSubtotal>
            <h3>Investment summary</h3>
            <span>
              <b>Claim account:</b> {activeClaimAccount}
            </span>
            <span>
              <b>vCOW to receive based on selected investment(s):</b> 4,054,671.28 vCOW
            </span>
          </InvestTokenSubtotal>

          <InvestFlowValidation>Approve all investment tokens before continuing</InvestFlowValidation>
        </InvestContent>
      ) : null}

      {/* Invest flow: Step 2 > Review summary */}
      {investFlowStep === 2 ? (
        <InvestContent>
          <AccountClaimSummary>
            <span>
              <b>Claiming with account:</b>
              <i>{account} (connected account)</i>
            </span>
            <span>
              {' '}
              <b>Receiving account:</b>
              <i>{activeClaimAccount}</i>
            </span>
          </AccountClaimSummary>
          <ClaimTable>
            <table>
              <thead>
                <tr>
                  <th>Claim type</th>
                  <th>Account &amp; vCOW amount</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {allClaims.map((claim) => (
                  <InvestSummaryRow claim={claim} key={claim.index} />
                ))}
              </tbody>
            </table>
          </ClaimTable>

          <h4>Ready to claim your vCOW?</h4>
          <p>
            <b>What will happen?</b> By sending this Ethereum transaction, you will be investing tokens from the
            connected account and exchanging them for vCOW tokens that will be received by the claiming account
            specified above.
          </p>
          <p>
            <b>Can I modify the invested amounts or invest partial amounts later?</b> No. Once you send the transaction,
            you cannot increase or reduce the investment. Investment oportunities can only be exercised once.
          </p>
          <p>
            <b>Important!</b> Please make sure you intend to claim and send vCOW to the mentioned receiving account(s)
          </p>
        </InvestContent>
      ) : null}
    </InvestFlow>
  )
}
