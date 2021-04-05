import React from 'react'
import { CurrencyAmount } from '@uniswap/sdk'

import { SEARCH_MODAL_BALANCE_SIGNIFICANT_DIGITS } from 'custom/constants'

import CurrencyListMod, { StyledBalanceText } from './CurrencyListMod'

export function Balance({ balance }: { balance: CurrencyAmount }) {
  return (
    <StyledBalanceText title={balance.toExact()}>
      {balance.toSignificant(SEARCH_MODAL_BALANCE_SIGNIFICANT_DIGITS)}
    </StyledBalanceText>
  )
}

export default function CurrencyList(
  ...params: Parameters<typeof CurrencyListMod>
): ReturnType<typeof CurrencyListMod> {
  return <CurrencyListMod {...params[0]} BalanceComponent={Balance} />
}
