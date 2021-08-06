import React from 'react'
import { Trans } from '@lingui/macro'

import ConfirmSwapModalMod from './ConfirmSwapModalMod'
import TradeGp from 'state/swap/TradeGp'
import { formatSmart } from 'utils/format'

export * from './ConfirmSwapModalMod'

function buildPendingText(trade: TradeGp | undefined): JSX.Element {
  const inputAmount = trade?.inputAmount
  const inputSymbol = inputAmount?.currency?.symbol
  const outputAmount = trade?.outputAmount
  const outputSymbol = outputAmount?.currency?.symbol

  return (
    <Trans>
      Swapping{' '}
      <span title={`${inputAmount?.toFixed(inputAmount?.currency.decimals)} ${inputSymbol}`}>
        {formatSmart(inputAmount) /* trade?.inputAmount?.toSignificant(6) */} {inputSymbol}
      </span>{' '}
      for{' '}
      <span title={`${outputAmount?.toFixed(outputAmount?.currency.decimals)} ${outputSymbol}`}>
        {formatSmart(outputAmount) /* trade?.outputAmount?.toSignificant(6) */} {outputSymbol}
      </span>
    </Trans>
  )
}

export default function ConfirmSwapModal(props: Omit<Parameters<typeof ConfirmSwapModalMod>[0], 'buildPendingText'>) {
  return <ConfirmSwapModalMod {...props} buildPendingText={buildPendingText} />
}
