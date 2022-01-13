import styled from 'styled-components/macro'
import CowProtocolLogo from 'components/CowProtocolLogo'

import { InvestTokenGroup, TokenLogo, InvestSummary, InvestInput } from '../styled'
import { formatSmart } from 'utils/format'
import Row from 'components/Row'
import { CheckCircle } from 'react-feather'
import { InvestOptionProps } from '.'
import { ApprovalState } from 'hooks/useApproveCallback'

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

export default function InvestOption({
  approveState,
  approveCallback,
  price,
  currencyAmount,
  percent,
}: InvestOptionProps) {
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
          <TokenLogo symbol={currencyAmount?.currency?.symbol || '-'} size={72} />
          <CowProtocolLogo size={72} />
        </span>
        <h3>Buy vCOW with {currencyAmount?.currency?.symbol}</h3>
      </div>

      <span>
        <InvestSummary>
          <span>
            <b>Price</b>{' '}
            <i>
              {formatSmart(price)} vCoW per {currencyAmount?.currency?.symbol}
            </i>
          </span>
          <span>
            <b>Token approval</b>
            <i>
              {approveState === ApprovalState.NOT_APPROVED ? (
                `${currencyAmount?.currency?.symbol} not approved`
              ) : (
                <Row>
                  {currencyAmount?.currency?.symbol} approved{' '}
                  <CheckCircle color="lightgreen" style={{ marginLeft: 5 }} />
                </Row>
              )}
            </i>
            {approveState === ApprovalState.NOT_APPROVED && (
              <button onClick={approveCallback}>Approve {currencyAmount?.currency?.symbol}</button>
            )}
          </span>
          <span>
            <b>Max. investment available</b>{' '}
            <i>
              {formatSmart(currencyAmount)} {currencyAmount?.currency?.symbol}
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
              <b>Balance:</b> <i>10,583.34 {currencyAmount?.currency?.symbol}</i>
              {/* Button should use the max possible amount the user can invest, considering their balance + max investment allowed */}
              <button>Invest max. possible</button>
            </span>
            <label>
              <b>{currencyAmount?.currency?.symbol}</b>
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
