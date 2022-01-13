import { useState, useEffect } from 'react'
import {
  InvestFlow,
  InvestContent,
  InvestTokenGroup,
  InvestInput,
  InvestSummary,
  InvestFlowValidation,
  InvestTokenSubtotal,
  StepIndicator,
  Steps,
  TokenLogo,
} from 'pages/Claim/styled'
import CowProtocolLogo from 'components/CowProtocolLogo'
import { useClaimState } from 'state/claim/hooks'
import { ClaimCommonTypes, UserClaimDataDetails } from './types'
import { ClaimStatus } from 'state/claim/actions'
import { useActiveWeb3React } from 'hooks/web3'
import { formatSmart } from 'utils/format'
import { CurrencyAmount, Token } from '@uniswap/sdk-core'
import styled from 'styled-components/macro'

const RangeSteps = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  justify-content: space-between;
`

const RangeStep = styled.button`
  background: none;
  border: none;
  font-size: 0.8rem;
  cursor: pointer;
  color: blue;
  padding: 0;
`

type InvestOptionProps = UserClaimDataDetails & {
  percent?: number
  value?: CurrencyAmount<Token>
}

type InvestmentFlowProps = Pick<ClaimCommonTypes, 'hasClaims'> & {
  isAirdropOnly: boolean
  userClaimData: InvestOptionProps[]
}

const InvestOption = ({ currency, price, currencyAmount, percent }: InvestOptionProps) => {
  const handlePercentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log(event.target.value)
  }

  const handleStepChange = (value: number) => {
    console.log(value)
  }

  return (
    <InvestTokenGroup>
      <div>
        <span>
          <TokenLogo symbol={currency} size={72} />
          <CowProtocolLogo size={72} />
        </span>
        <h3>Buy vCOW with {currency}</h3>
      </div>

      <span>
        <InvestSummary>
          <span>
            <b>Price</b>{' '}
            <i>
              {formatSmart(price)} vCoW per {currency}
            </i>
          </span>
          <span>
            <b>Token approval</b>
            <i>{currency} not approved</i>
            <button>Approve {currency}</button>
          </span>
          <span>
            <b>Max. investment available</b>{' '}
            <i>
              {formatSmart(currencyAmount)} {currency}
            </i>
          </span>
          <span>
            <b>Available investment used</b>

            <div>
              <RangeSteps>
                {[0, 25, 50, 75, 100].map((step: number) => (
                  <RangeStep onClick={() => handleStepChange(step)} key={step}>
                    {step}%
                  </RangeStep>
                ))}
              </RangeSteps>

              <input
                style={{ width: '100%' }}
                onChange={handlePercentChange}
                type="range"
                min="0"
                max="100"
                value={percent}
              />
            </div>
          </span>
        </InvestSummary>
        <InvestInput>
          <div>
            <span>
              <b>Balance:</b> <i>10,583.34 {currency}</i>
              {/* Button should use the max possible amount the user can invest, considering their balance + max investment allowed */}
              <button>Invest max. possible</button>
            </span>
            <label>
              <b>{currency}</b>
              <input max={formatSmart(currencyAmount)} style={{ width: '100%' }} type="number" />
            </label>
            <i>Receive: 32,432.54 vCOW</i>
            {/* Insufficient balance validation error */}
            <small>
              Insufficient balance to invest. Adjust the amount or go back to remove this investment option.
            </small>
          </div>
        </InvestInput>
      </span>
    </InvestTokenGroup>
  )
}

export default function InvestmentFlow({ hasClaims, isAirdropOnly, userClaimData }: InvestmentFlowProps) {
  const { account } = useActiveWeb3React()
  const { activeClaimAccount, claimStatus, isInvestFlowActive, investFlowStep, selected } = useClaimState()

  const [investData, setInvestData] = useState<UserClaimDataDetails[]>([])

  useEffect(() => {
    if (userClaimData) {
      const filtered = userClaimData.filter(({ index }) => selected.includes(index))
      const mapped = filtered.map((claim) => ({ ...claim, percent: 100, value: claim.currencyAmount }))
      setInvestData(mapped)
    }
  }, [selected, userClaimData])

  if (!activeClaimAccount || !hasClaims || !isInvestFlowActive) return null
  if (claimStatus !== ClaimStatus.DEFAULT || isAirdropOnly) return null

  return (
    <InvestFlow>
      <StepIndicator>
        <h1>
          {investFlowStep === 0
            ? 'Claiming vCOW is a two step process'
            : investFlowStep === 1
            ? 'Set allowance to Buy vCOW'
            : 'Confirm transaction to claim all vCOW'}
        </h1>
        <Steps step={investFlowStep}>
          <li>Allowances: Approve all tokens to be used for investment.</li>
          <li>Submit and confirm the transaction to claim vCOW</li>
        </Steps>
      </StepIndicator>

      {/* Invest flow: Step 1 > Set allowances and investment amounts */}
      {investFlowStep === 1 ? (
        <InvestContent>
          <p>
            Your account can participate in the investment of vCOW. Each investment opportunity will allow you to invest
            up to a predefined maximum amount of tokens{' '}
          </p>

          {investData.map((claim) => (
            <InvestOption key={claim.index} {...claim} />
          ))}

          <InvestTokenSubtotal>
            {activeClaimAccount} will receive: 4,054,671.28 vCOW based on investment(s)
          </InvestTokenSubtotal>

          <InvestFlowValidation>Approve all investment tokens before continuing</InvestFlowValidation>
        </InvestContent>
      ) : null}

      {/* Invest flow: Step 2 > Review summary */}
      {investFlowStep === 2 ? (
        <InvestContent>
          1. Claim airdrop: {activeClaimAccount} receives 13,120.50 vCOW (Note: please make sure you intend to claim and
          send vCOW to the mentioned account)
          <br />
          <br />
          2. Claim and invest: Investing with account: {account} (connected account). Investing: 1343 GNO (50% of
          available investing opportunity) and 32 ETH (30% of available investing opportunity)
          <br />
          <br />
          3. Receive vCOW claims on account {activeClaimAccount}: 23,947.6 vCOW - available NOW! and 120,567.12 vCOW -
          Vested linearly 4 years <br />
          <br />
          <br />
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
        </InvestContent>
      ) : null}
    </InvestFlow>
  )
}
