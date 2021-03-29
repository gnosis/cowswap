import React from 'react'
import { TradeWithFee } from 'state/swap/extension'
import QuestionHelper from 'components/QuestionHelper'
import styled from 'styled-components'

interface FeeInformationTooltipProps {
  trade?: TradeWithFee
  label: React.ReactNode
  showHelper: boolean
  amountBeforeFees?: string
  amountAfterFees?: string
  feeAmount?: string
  feeSymbol?: string
  type: string
}
const FeeTooltipLine = styled.p`
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  align-items: center;
  margin: 0;

  font-size: small;
`
export default function FeeInformationTooltip(props: FeeInformationTooltipProps) {
  const { trade, label, amountBeforeFees, amountAfterFees, feeAmount, feeSymbol, type, showHelper } = props

  return (
    <div>
      <span>{label}</span>{' '}
      {trade && showHelper && (
        <QuestionHelper
          text={
            <div>
              <FeeTooltipLine>
                <span>Before fees</span>
                <span>{amountBeforeFees}</span>{' '}
              </FeeTooltipLine>
              <FeeTooltipLine>
                <span>GP fee</span>
                <span>
                  {feeAmount} {feeSymbol}
                </span>{' '}
              </FeeTooltipLine>
              <FeeTooltipLine>
                <span>Gas costs</span>
                <strong>Free</strong>{' '}
              </FeeTooltipLine>
              ---
              <FeeTooltipLine>
                <strong>{type}</strong>
                <strong>{amountAfterFees}</strong>{' '}
              </FeeTooltipLine>
            </div>
          }
        />
      )}
    </div>
  )
}
