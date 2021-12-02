import { useEffect, useState } from 'react'
import { Percent } from '@uniswap/sdk-core'
import { OrderKind } from '@gnosis.pm/gp-v2-contracts'

import { tryParseAmount, useSwapState } from 'state/swap/hooks'
import { Field } from 'state/swap/actions'
import { QuoteInformationObject } from 'state/price/reducer'
import { QuoteError } from 'state/price/actions'
import { DEBOUNCE_TIME } from 'state/price/updater'

import { FallbackPriceImpactParams } from './commonTypes'
import { calculateFallbackPriceImpact, FeeQuoteParams } from 'utils/price'

import { useCalculateQuote, useExactInSwap, useExactOutSwap } from 'hooks/usePriceImpact/useQuoteAndSwap'
import { useCurrency } from 'hooks/Tokens'
import useDebounce from 'hooks/useDebounce'

function _isQuoteValid(quote: QuoteInformationObject | FeeQuoteParams | undefined): quote is QuoteInformationObject {
  return Boolean(quote && 'lastCheck' in quote)
}

export default function useFallbackPriceImpact({ abTrade, fiatPriceImpact }: FallbackPriceImpactParams) {
  const {
    typedValue: unbouncedTypedValue,
    INPUT: { currencyId: sellToken },
    OUTPUT: { currencyId: buyToken },
    independentField,
  } = useSwapState()

  const typedValue = useDebounce(unbouncedTypedValue, DEBOUNCE_TIME)

  const shouldCalculate = !Boolean(fiatPriceImpact)

  const inputCurrency = useCurrency(sellToken)
  const outputCurrency = useCurrency(buyToken)

  const isExactIn = independentField === Field.INPUT
  const parsedAmount = shouldCalculate
    ? tryParseAmount(typedValue, (isExactIn ? inputCurrency : outputCurrency) ?? undefined)
    : undefined

  const { quote, loading: loading } = useCalculateQuote({
    amountAtoms: parsedAmount?.quotient.toString(),
    kind: isExactIn ? OrderKind.BUY : OrderKind.SELL,
    sellToken: buyToken,
    buyToken: sellToken,
    fromDecimals: outputCurrency?.decimals,
    toDecimals: inputCurrency?.decimals,
  })

  const baTradeIn = useExactInSwap({
    quote: _isQuoteValid(quote) ? quote : undefined,
    parsedAmount: !isExactIn ? parsedAmount : undefined,
    outputCurrency: inputCurrency ?? undefined,
  })

  const baTradeOut = useExactOutSwap({
    quote: _isQuoteValid(quote) ? quote : undefined,
    parsedAmount: isExactIn ? parsedAmount : undefined,
    inputCurrency: outputCurrency ?? undefined,
  })

  const baTrade = baTradeIn || baTradeOut

  const [impact, setImpact] = useState<Percent | undefined>()
  const [error, setError] = useState<QuoteError | undefined>()

  // primitive values to use as dependencies
  const abIn = abTrade?.inputAmount.quotient.toString()
  const abOut = abTrade?.outputAmount.quotient.toString()
  const baIn = baTrade?.inputAmount.quotient.toString()
  const baOut = baTrade?.outputAmount.quotient.toString()
  const quoteError = quote?.error

  useEffect(() => {
    // we have no fiat price impact and there's a trade, we need to use ABA impact
    if (quoteError) {
      setImpact(undefined)
      setError(quoteError)
    } else if (!loading && abIn && abOut && baIn && baOut) {
      let impact = undefined
      if (isExactIn) {
        impact = calculateFallbackPriceImpact(abOut, baIn)
      } else {
        impact = calculateFallbackPriceImpact(abIn, baOut)
      }
      setImpact(impact)
      setError(undefined)
    } else {
      // reset all
      setImpact(undefined)
      setError(undefined)
    }
  }, [abIn, abOut, baIn, baOut, quoteError, isExactIn, loading, unbouncedTypedValue, sellToken, buyToken])

  return { impact, error, loading }
}
