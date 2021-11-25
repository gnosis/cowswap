import { useEffect, useMemo, useState } from 'react'
import { Percent } from '@uniswap/sdk-core'

import { useSwapState } from 'state/swap/hooks'
import { Field } from 'state/swap/actions'
import { useGetQuoteAndStatus } from 'state/price/hooks'

import useExactInSwap, { useCalculateQuote } from './useQuoteAndSwap'
import { FallbackPriceImpactParams } from './commonTypes'
import { calculateFallbackPriceImpact, FeeQuoteParams } from 'utils/price'
import TradeGp from 'state/swap/TradeGp'
import { useActiveWeb3React } from 'hooks/web3'
import { QuoteInformationObject } from 'state/price/reducer'
import { QuoteError } from 'state/price/actions'

type SwapParams = { trade?: TradeGp; sellToken?: string | null; buyToken?: string | null }

function _isQuoteValid(quote: QuoteInformationObject | FeeQuoteParams | undefined): quote is QuoteInformationObject {
  return Boolean(quote && 'lastCheck' in quote)
}

function _calculateSwapParams(isExactIn: boolean, { trade, sellToken, buyToken }: SwapParams) {
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

const EMPTY_STATE = {
  impact: undefined,
  error: undefined,
}

export default function useFallbackPriceImpact({ abTrade, fiatPriceImpact }: FallbackPriceImpactParams) {
  const {
    typedValue,
    INPUT: { currencyId: sellToken },
    OUTPUT: { currencyId: buyToken },
    independentField,
  } = useSwapState()
  const isExactIn = independentField === Field.INPUT
  const { chainId } = useActiveWeb3React()

  // Should we even calc this? Check if fiatPriceImpact exists
  const shouldCalculate = !Boolean(fiatPriceImpact)

  // Calculate the necessary params to get the inverse trade impact
  const { parsedAmount, outputCurrency, ...swapQuoteParams } = useMemo(
    () => ({
      parsedAmount: _calculateTradeAmount(abTrade, isExactIn, shouldCalculate),
      ..._calculateSwapParams(isExactIn, { trade: abTrade, sellToken, buyToken }),
    }),
    [abTrade, buyToken, sellToken, shouldCalculate, isExactIn]
  )

  const quote = useCalculateQuote({
    amountAtoms: parsedAmount?.quotient.toString(),
    ...swapQuoteParams,
  })

  // we calculate the trade going B > A
  // using the output values from the original A > B trade
  const baTrade = useExactInSwap({
    // if priceImpact, give undefined and dont compute swap
    // the amount traded now is the A > B output amount without fees
    // TODO: is this the amount with or without fees?
    quote: _isQuoteValid(quote) ? quote : undefined,
    parsedAmount,
    outputCurrency,
  })

  const [priceImpact, setPriceImpact] = useState<{
    impact: Percent | undefined
    error: QuoteError | undefined
  }>(EMPTY_STATE)

  // we set price impact to undefined when loading a NEW quote only
  const { isGettingNewQuote } = useGetQuoteAndStatus({ token: sellToken, chainId })

  // primitive values to use as dependencies
  const abIn = abTrade?.inputAmount.quotient.toString()
  const abOut = abTrade?.outputAmount.quotient.toString()
  const baOut = baTrade?.outputAmount.quotient.toString()
  const quoteError = quote?.error

  useEffect(() => {
    // we have no fiat price impact and there's a trade, we need to use ABA impact
    if (quoteError) {
      setPriceImpact({ impact: undefined, error: quoteError })
    } else if (abIn && abOut && baOut) {
      const impact = calculateFallbackPriceImpact(isExactIn ? abIn : abOut, baOut)
      setPriceImpact({ impact, error: undefined })
    } else {
      setPriceImpact(EMPTY_STATE)
    }
  }, [abIn, abOut, baOut, quoteError, isExactIn])

  // on changes to typedValue, we hide impact
  // quote loading so we hide impact
  // prevents lingering calculations and jumping impacts
  useEffect(() => {
    if (typedValue || isGettingNewQuote) {
      setPriceImpact(EMPTY_STATE)
    }
  }, [isGettingNewQuote, typedValue])

  return priceImpact
}
