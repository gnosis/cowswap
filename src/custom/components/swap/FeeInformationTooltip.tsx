import React from 'react'
import TradeGp from 'state/swap/TradeGp'
import QuestionHelper from 'components/QuestionHelper'
import styled from 'styled-components'
import { useUSDCValue } from 'hooks/useUSDCPrice'
import { formatSmart } from 'utils/format'

interface FeeInformationTooltipProps {
  trade?: TradeGp
  label: React.ReactNode
  showHelper: boolean
  amountBeforeFees?: string
  amountAfterFees?: string
  feeAmount?: string
  type: 'From' | 'To'
}

const WrappedQuestionHelper = styled(QuestionHelper)`
  display: inline-flex;
`

export const FeeInformationTooltipWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 22.39px;
`

const FeeTooltipLine = styled.p`
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  align-items: center;
  margin: 0;

  font-size: small;

  > .green {
    color: ${({ theme }) => theme.green1};
  }
`

const Breakline = styled.p`
  height: 0;
  border: 0.1px solid #00000052;
  margin: 0.3rem 0;
  width: 100%;
`

const FeeAmountAndFiat = styled.span`
  ${({ theme }) => theme.flexRowNoWrap};
  align-items: center;
  justify-content: center;
  gap: 5px;

  font-weight: 600;

  > small {
    font-size: 75%;
    font-weight: normal;
  }
`

export default function FeeInformationTooltip(props: FeeInformationTooltipProps) {
  const { trade, label, amountBeforeFees, amountAfterFees, feeAmount, type, showHelper } = props

  const fiatValue = useUSDCValue(type === 'From' ? trade?.inputAmount : trade?.outputAmount)

  if (!trade || !showHelper) return null

  return (
    <FeeInformationTooltipWrapper>
      <span>
        {label}{' '}
        <WrappedQuestionHelper
          text={
            <div>
              <FeeTooltipLine>
                <span>Before fee</span>
                <span>{amountBeforeFees}</span>{' '}
              </FeeTooltipLine>
              <FeeTooltipLine>
                <span>Fee</span>
                <span>
                  {type === 'From' ? '+' : '-'}
                  {feeAmount}
                </span>{' '}
              </FeeTooltipLine>
              <FeeTooltipLine>
                <span>Gas costs</span>
                <strong className="green">Free</strong>{' '}
              </FeeTooltipLine>
              <Breakline />
              <FeeTooltipLine>
                <strong>{type}</strong>
                <strong>{amountAfterFees}</strong>{' '}
              </FeeTooltipLine>
            </div>
          }
        />
      </span>
      <FeeAmountAndFiat>
        {amountAfterFees} {fiatValue && <small>~${formatSmart(fiatValue)}</small>}
      </FeeAmountAndFiat>
    </FeeInformationTooltipWrapper>
  )
}
