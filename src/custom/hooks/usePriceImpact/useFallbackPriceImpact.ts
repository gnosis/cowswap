import { useEffect, useState } from 'react'
import { Percent } from '@uniswap/sdk-core'

import { useSwapState } from 'state/swap/hooks'
import { Field } from 'state/swap/actions'
import { useIsQuoteLoading } from 'state/price/hooks'

import useQuoteAndSwap from './useQuoteAndSwap'
import { FallbackPriceImpactParams } from './commonTypes'
import { calculateFallbackPriceImpact } from 'utils/price'

export default function useFallbackPriceImpact({ abTrade, fiatPriceImpact }: FallbackPriceImpactParams) {
  const {
    INPUT: { currencyId: sellToken },
    OUTPUT: { currencyId: buyToken },
    independentField,
  } = useSwapState()
  const isExactIn = independentField === Field.INPUT
  // we calculate the trade going B > A
  // using the output values from the original A > B trade
  const baTrade = useQuoteAndSwap({
    // if priceImpact, give undefined and dont compute swap
    // the amount traded now is the A > B output amount without fees
    // TODO: is this the amount with or without fees?
    parsedAmount: !fiatPriceImpact ? (isExactIn ? abTrade?.outputAmount : abTrade?.inputAmount) : undefined,
    // for the B > A SELL/SELL trade, the outputCurrency is the original input
    // for the B > A BUY/SELL trade, the outputCurrency is the original output
    outputCurrency: isExactIn ? abTrade?.inputAmount.currency : abTrade?.outputAmount.currency,
    // on buy orders we dont inverse it
    sellToken: isExactIn ? buyToken : sellToken,
    buyToken: isExactIn ? sellToken : buyToken,
    fromDecimals: isExactIn ? abTrade?.outputAmount.currency.decimals : abTrade?.inputAmount.currency.decimals,
    toDecimals: isExactIn ? abTrade?.inputAmount.currency.decimals : abTrade?.outputAmount.currency.decimals,
  })

  const [priceImpact, setPriceImpact] = useState<Percent | undefined>()

  // we set price impact to undefined when loading
  const quoteLoading = useIsQuoteLoading()

  // primitive values to use as dependencies
  const abIn = abTrade?.inputAmount.quotient.toString()
  const abOut = abTrade?.outputAmount.quotient.toString()
  const baOut = baTrade?.outputAmount.quotient.toString()

  useEffect(() => {
    // we have no fiat price impact and there's a trade, we need to use ABA impact
    if (abIn && abOut && baOut) {
      const abaPriceImpact = calculateFallbackPriceImpact(isExactIn ? abIn : abOut, baOut)
      setPriceImpact(abaPriceImpact)
    } else {
      setPriceImpact(undefined)
    }
  }, [abIn, abOut, baOut, isExactIn])

  // quote loading so we null the aba impact
  // prevents lingering calculations and jumping impacts
  useEffect(() => {
    if (quoteLoading) {
      setPriceImpact(undefined)
    }
  }, [quoteLoading])

  return priceImpact
}
