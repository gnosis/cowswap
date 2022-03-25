import React, { useCallback, useMemo } from 'react'
import TradeGp from 'state/swap/TradeGp'
import QuestionHelper from 'components/QuestionHelper'
import styled from 'styled-components/macro'
import { formatMax, formatSmart } from 'utils/format'
import useTheme from 'hooks/useTheme'
import { FIAT_PRECISION } from 'constants/index'
import { CurrencyAmount, Token } from '@uniswap/sdk-core'
import useCowBalanceAndSubsidy from 'hooks/useCowBalanceAndSubsidy'
import { BigNumber } from 'bignumber.js'
import { ONE_BIG_NUMBER } from '@gnosis.pm/dex-js'

interface FeeInformationTooltipProps {
  trade?: TradeGp
  label: React.ReactNode
  showHelper: boolean
  amountBeforeFees?: string
  amountAfterFees?: string
  feeAmount?: string
  type: 'From' | 'To'
  fiatValue: CurrencyAmount<Token> | null
  showFiat?: boolean
  allowsOffchainSigning: boolean
}

const WrappedQuestionHelper = styled(QuestionHelper)`
  display: inline-flex;
`

export const FeeInformationTooltipWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 60px;
`

const FeeTooltipLine = styled.p<{ discount?: boolean }>`
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  align-items: center;
  margin: 0;
  gap: 0 8px;

  ${({ discount = false }) => discount && 'text-decoration: line-through;'}

  font-size: small;

  > .green {
    color: ${({ theme }) => theme.green1};
  }
`

const Breakline = styled.p`
  height: 0;
  width: 100%;
  margin: 6px 0;

  border-bottom-color: #9191912e;
  border-bottom: 1px;
  border-bottom-style: inset;
`

const FeeAmountAndFiat = styled.span`
  ${({ theme }) => theme.flexColumnNoWrap};
  align-items: flex-end;
  justify-content: center;
  gap: 5px;

  font-weight: 600;

  > small {
    font-size: 75%;
    font-weight: normal;
  }
`

const FeeInnerWrapper = styled.div`
  ${({ theme }) => theme.flexColumnNoWrap};
  gap: 2px;
`

const FeeBreakdownLine = ({
  feeAmount,
  discount,
  type,
  symbol,
}: FeeInformationTooltipProps & { symbol: string | undefined; discount: number }) => {
  const typeString = type === 'From' ? '+' : '-'

  const FeeAmount = useCallback(() => {
    // 1 + DISCOUNT/100 e.g 1 + 0.15 = 1.15
    const discountBn = ONE_BIG_NUMBER.plus(new BigNumber(discount).div(new BigNumber('100')))
    // we need the fee BEFORE the discount as the backend will return us the adjusted fee with discount
    const adjustedFee = feeAmount ? new BigNumber(feeAmount).times(discountBn).toString(10) : undefined

    return (
      <>
        <span>Fee</span>
        {adjustedFee ? (
          <span>
            {typeString}
            {adjustedFee} {symbol}
          </span>
        ) : (
          <strong className="green">Free</strong>
        )}
      </>
    )
  }, [discount, feeAmount, symbol, typeString])

  const FeeDiscountedAmount = useCallback(
    () => (
      <>
        <strong className="green">Fee [-{discount}%]</strong>
        <span>
          {typeString}
          {feeAmount} {symbol}
        </span>
      </>
    ),
    [discount, feeAmount, symbol, typeString]
  )

  return (
    <>
      <FeeTooltipLine discount={!!discount}>
        <FeeAmount />
      </FeeTooltipLine>
      {!!discount && (
        <FeeTooltipLine>
          <FeeDiscountedAmount />
        </FeeTooltipLine>
      )}
    </>
  )
}

export default function FeeInformationTooltip(props: FeeInformationTooltipProps) {
  const {
    trade,
    label,
    amountBeforeFees,
    amountAfterFees,
    type,
    showHelper,
    fiatValue,
    showFiat = false,
    allowsOffchainSigning,
  } = props

  const theme = useTheme()

  const { subsidy } = useCowBalanceAndSubsidy()

  const [symbol, fullFeeAmount] = useMemo(() => {
    const amount = trade?.[type === 'From' ? 'inputAmount' : 'outputAmount']
    return amount ? [amount.currency.symbol || '', formatMax(amount, amount.currency.decimals) || '-'] : []
  }, [trade, type])

  if (!trade || !showHelper) return null

  return (
    <FeeInformationTooltipWrapper>
      <span>
        {label}{' '}
        <WrappedQuestionHelper
          bgColor={theme.bg4}
          color={theme.text1}
          text={
            <FeeInnerWrapper>
              <FeeTooltipLine>
                <span>Before fee</span>
                <span>
                  {amountBeforeFees} {symbol}
                </span>{' '}
              </FeeTooltipLine>
              <FeeBreakdownLine {...props} discount={subsidy.discount} symbol={symbol} />
              {/* TODO: Add gas costs when available (wait for design) */}
              {allowsOffchainSigning && (
                <FeeTooltipLine>
                  <span>Gas costs</span>
                  <strong className="green">Free</strong>
                </FeeTooltipLine>
              )}
              <Breakline />
              <FeeTooltipLine>
                <strong>{type}</strong>
                <strong>
                  {amountAfterFees} {symbol}
                </strong>{' '}
              </FeeTooltipLine>
            </FeeInnerWrapper>
          }
        />
      </span>
      <FeeAmountAndFiat title={`${fullFeeAmount} ${symbol}`}>
        {amountAfterFees} {showFiat && fiatValue && <small>≈ ${formatSmart(fiatValue, FIAT_PRECISION)}</small>}
      </FeeAmountAndFiat>
    </FeeInformationTooltipWrapper>
  )
}
