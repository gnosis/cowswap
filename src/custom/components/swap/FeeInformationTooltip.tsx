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
  type: string
}

const Wrapper = styled.div`
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
`

const Breakline = styled.p`
  height: 0;
  border: 0.1px solid #00000052;
  margin: 0.3rem 0;
  width: 100%;
`

export default function FeeInformationTooltip(props: FeeInformationTooltipProps) {
  const { trade, label, amountBeforeFees, amountAfterFees, feeAmount, type, showHelper } = props

  return (
    <Wrapper>
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
                <span>{feeAmount}</span>{' '}
              </FeeTooltipLine>
              <FeeTooltipLine>
                <span>Gas costs</span>
                <strong>Free</strong>{' '}
              </FeeTooltipLine>
              <Breakline />
              <FeeTooltipLine>
                <strong>{type}</strong>
                <strong>{amountAfterFees}</strong>{' '}
              </FeeTooltipLine>
            </div>
          }
        />
      )}
    </Wrapper>
  )
}
