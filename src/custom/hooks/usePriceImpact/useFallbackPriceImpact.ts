import { useEffect, useMemo, useState } from 'react'
import { Percent, TradeType } from '@uniswap/sdk-core'

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
      // Run inverse (B > A) sell trade
      sellToken: buyToken,
      buyToken: sellToken,
      fromDecimals: trade.outputAmount.currency.decimals,
      toDecimals: trade.inputAmount.currency.decimals,
    }
  } else {
    // First trade was a buy order
    // we need to use the same order but make a sell order
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

function _calculateParsedAmount(trade: TradeGp | undefined, isExactIn: boolean, shouldCalculate: boolean) {
  if (!shouldCalculate || !trade) return undefined
  // First trade was a sell order, we need to make a new sell order using the
  // first trade's output amount
  const amount = isExactIn ? trade.outputAmount : trade.inputAmount

  return amount
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
      parsedAmount: _calculateParsedAmount(abTrade, isExactIn, shouldCalculate),
      ..._calculateSwapParams(isExactIn, { trade: abTrade, sellToken, buyToken }),
    }),
    [abTrade, buyToken, sellToken, shouldCalculate, isExactIn]
  )

  const { quote, loading: loading } = useCalculateQuote({
    amountAtoms: parsedAmount?.quotient.toString(),
    ...swapQuoteParams,
  })

  // we calculate the trade going B > A
  // using the output values from the original A > B trade
  const baTrade = useExactInSwap({
    // if impact, give undefined and dont compute swap
    // the amount traded now is the A > B output amount without fees
    // TODO: is this the amount with or without fees?
    quote: _isQuoteValid(quote) ? quote : undefined,
    parsedAmount,
    outputCurrency,
  })

  const [impact, setImpact] = useState<Percent | undefined>()
  const [error, setError] = useState<QuoteError | undefined>()

  // we set price impact to undefined when loading a NEW quote only
  const { isGettingNewQuote } = useGetQuoteAndStatus({ token: sellToken, chainId })

  // primitive values to use as dependencies
  // const tradeType = abTrade?.tradeType
  const abIn = abTrade?.inputAmount.quotient.toString()
  const abOut = abTrade?.outputAmount.quotient.toString()
  const baOut = baTrade?.outputAmount.quotient.toString()
  const quoteError = quote?.error

  useEffect(() => {
    // we have no fiat price impact and there's a trade, we need to use ABA impact
    if (quoteError) {
      setImpact(undefined)
      setError(quoteError)
    } else if (!loading && abIn && abOut && baOut) {
      const params = {
        abTradeType: isExactIn ? TradeType.EXACT_INPUT : TradeType.EXACT_OUTPUT,
        // IV
        initialValue: isExactIn ? abIn : abOut,
        // MV
        middleValue: isExactIn ? abOut : abIn,
        // FV
        finalValue: baOut,
      }
      const impact = calculateFallbackPriceImpact(params)
      setImpact(impact)
      setError(undefined)
    } else {
      // reset all
      setImpact(undefined)
      setError(undefined)
    }
  }, [abIn, abOut, baOut, quoteError, isExactIn, loading])

  // on changes to typedValue, we hide impact
  // quote loading so we hide impact
  // prevents lingering calculations and jumping impacts
  useEffect(() => {
    if (typedValue || isGettingNewQuote) {
      setImpact(undefined)
      setError(undefined)
    }
  }, [isGettingNewQuote, typedValue])

  return { impact, error, loading }
}
