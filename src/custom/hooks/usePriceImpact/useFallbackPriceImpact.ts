import { useEffect, useState } from 'react'
import { Percent } from '@uniswap/sdk-core'

import { useSwapState } from 'state/swap/hooks'
import { Field } from 'state/swap/actions'
import { useIsQuoteLoading } from 'state/price/hooks'

import useQuoteAndSwap from './useQuoteAndSwap'
import { FallbackPriceImpactParams } from './commonTypes'
import { calculateFallbackPriceImpact } from 'utils/price'
import TradeGp from '@src/custom/state/swap/TradeGp'

function _calculateSwapParams(
  isExactIn: boolean,
  { trade, sellToken, buyToken }: { trade?: TradeGp; sellToken?: string | null; buyToken?: string | null }
) {
  if (!trade) return undefined

  if (isExactIn) {
    return {
      outputCurrency: trade.inputAmount.currency,
      // on buy orders we dont inverse it
      sellToken: buyToken,
      buyToken: sellToken,
      fromDecimals: trade.outputAmount.currency.decimals,
      toDecimals: trade.inputAmount.currency.decimals,
    }
  } else {
    return {
      outputCurrency: trade.outputAmount.currency,
      // on buy orders we dont inverse it
      sellToken,
      buyToken,
      fromDecimals: trade.inputAmount.currency.decimals,
      toDecimals: trade.outputAmount.currency.decimals,
    }
  }
}

function _calculateTradeAmount(trade: TradeGp | undefined, isExactIn: boolean, shouldCalculate: boolean) {
  if (!shouldCalculate || !trade) return undefined
  const amount = isExactIn ? trade.outputAmount : trade.inputAmount

  return amount
}

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
    parsedAmount: _calculateTradeAmount(abTrade, isExactIn, !fiatPriceImpact),
    ..._calculateSwapParams(isExactIn, { trade: abTrade, sellToken, buyToken }),
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
