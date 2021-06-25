import { Trans } from '@lingui/macro'
import { Currency, Percent, TradeType, CurrencyAmount } from '@uniswap/sdk-core'
// import { Trade as V2Trade } from '@uniswap/v2-sdk'
// import { Trade as V3Trade } from '@uniswap/v3-sdk'
import React, { useContext, useMemo, useState } from 'react'
import { Text } from 'rebass'
import { ButtonError } from 'components/Button'
import { AutoRow, RowBetween, RowFixed } from 'components/Row'
import { SwapCallbackError, StyledBalanceMaxMini } from 'components/swap/styleds'
import { Repeat } from 'react-feather'
import { ThemeContext } from 'styled-components'
import { Field } from 'state/swap/actions'
import { TYPE } from 'theme'
import { computeSlippageAdjustedAmounts, formatExecutionPrice } from 'utils/prices'
import { AutoColumn } from 'components/Column'
import QuestionHelper from 'components/QuestionHelper'
import TradeGp from 'state/swap/TradeGp'
import { DEFAULT_PRECISION, SHORT_PRECISION } from 'constants/index'
import { getMinimumReceivedTooltip } from 'utils/tooltips'

export interface SwapModalFooterProps {
  trade: TradeGp
  allowedSlippage: Percent
  onConfirm: () => void
  swapErrorMessage: React.ReactNode | undefined
  disabledConfirm: boolean
  fee: { feeTitle: string; feeTooltip: string; feeAmount?: CurrencyAmount<Currency> | null }
}

export default function SwapModalFooter({
  onConfirm,
  swapErrorMessage,
  disabledConfirm,
  trade,
  allowedSlippage,
  fee,
}: /* 
  {
  trade: V2Trade<Currency, Currency, TradeType> | V3Trade<Currency, Currency, TradeType>
  onConfirm: () => void
  swapErrorMessage: ReactNode | undefined
  disabledConfirm: boolean
} */
SwapModalFooterProps) {
  const [showInverted, setShowInverted] = useState<boolean>(false)
  const theme = useContext(ThemeContext)
  const slippageAdjustedAmounts = useMemo(
    () => computeSlippageAdjustedAmounts(trade, allowedSlippage),
    [allowedSlippage, trade]
  )
  const { feeTitle, feeTooltip, feeAmount } = fee

  const isExactIn = trade.tradeType === TradeType.EXACT_INPUT

  return (
    <>
      {/* TODO V3 GP: remove this code and move to SwapModalHeader */}
      <AutoColumn gap="0px">
        <RowBetween align="center">
          <Text fontWeight={400} fontSize={14} color={theme.text2}>
            Price
          </Text>
          <Text
            fontWeight={500}
            fontSize={14}
            color={theme.text1}
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              display: 'flex',
              textAlign: 'right',
              paddingLeft: '10px',
            }}
          >
            {formatExecutionPrice(trade, showInverted)}
            <StyledBalanceMaxMini onClick={() => setShowInverted(!showInverted)}>
              <Repeat size={14} />
            </StyledBalanceMaxMini>
          </Text>
        </RowBetween>

        <RowBetween>
          <RowFixed>
            <TYPE.black fontSize={14} fontWeight={400} color={theme.text2}>
              {isExactIn ? 'Minimum received' : 'Maximum sold'}
            </TYPE.black>
            <QuestionHelper text={getMinimumReceivedTooltip(allowedSlippage, isExactIn)} />
          </RowFixed>
          <RowFixed>
            <TYPE.black fontSize={14}>
              {trade.tradeType === TradeType.EXACT_INPUT
                ? slippageAdjustedAmounts[Field.OUTPUT]?.toSignificant(SHORT_PRECISION) ?? '-'
                : slippageAdjustedAmounts[Field.INPUT]?.toSignificant(SHORT_PRECISION) ?? '-'}
            </TYPE.black>
            <TYPE.black fontSize={14} marginLeft={'4px'}>
              {trade.tradeType === TradeType.EXACT_INPUT
                ? trade.outputAmount.currency.symbol
                : trade.inputAmount.currency.symbol}
            </TYPE.black>
          </RowFixed>
        </RowBetween>
        {/* <RowBetween>
          <RowFixed>
            <TYPE.black color={theme.text2} fontSize={14} fontWeight={400}>
              Price Impact
            </TYPE.black>
            <QuestionHelper text="The difference between the market price and your price due to trade size." />
          </RowFixed>
          <FormattedPriceImpact priceImpact={priceImpactWithoutFee} />
        </RowBetween> */}
        <RowBetween>
          {/* <RowFixed>
            <TYPE.black fontSize={14} fontWeight={400} color={theme.text2}>
              Liquidity Provider Fee
            </TYPE.black>
            <QuestionHelper text="A portion of each trade (0.30%) goes to liquidity providers as a protocol incentive." />
          </RowFixed>
          <TYPE.black fontSize={14}>
            {realizedLPFee ? realizedLPFee?.toSignificant(6) + ' ' + trade.inputAmount.currency.symbol : '-'}
          </TYPE.black> */}
          <RowFixed>
            <TYPE.black fontSize={14} fontWeight={400} color={theme.text2}>
              {feeTitle}
            </TYPE.black>
            <QuestionHelper text={feeTooltip} />
          </RowFixed>
          <TYPE.black fontSize={14}>
            {feeAmount ? feeAmount.toSignificant(DEFAULT_PRECISION) + ' ' + feeAmount.currency.symbol : '-'}
          </TYPE.black>
        </RowBetween>
      </AutoColumn>

      <AutoRow>
        <ButtonError
          onClick={onConfirm}
          disabled={disabledConfirm}
          style={{ margin: '10px 0 0 0' }}
          id="confirm-swap-or-send"
        >
          <Text fontSize={20} fontWeight={500}>
            <Trans>Confirm Swap</Trans>
          </Text>
        </ButtonError>

        {swapErrorMessage ? <SwapCallbackError error={swapErrorMessage} /> : null}
      </AutoRow>
    </>
  )
}
