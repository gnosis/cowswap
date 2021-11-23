import { useEffect, useState } from 'react'
import { OrderKind } from '@gnosis.pm/gp-v2-contracts'
import { Currency, CurrencyAmount, Percent } from '@uniswap/sdk-core'

import { useTradeExactInWithFee } from 'state/swap/extension'
import { useSwapState } from 'state/swap/hooks'
import { QuoteInformationObject } from 'state/price/reducer'
import { Field } from 'state/swap/actions'
import TradeGp from 'state/swap/TradeGp'

import { useHigherUSDValue } from 'hooks/useUSDCPrice'
import { useWalletInfo } from 'hooks/useWalletInfo'
import { useActiveWeb3React } from 'hooks/web3'

import { computeFiatValuePriceImpact } from 'utils/computeFiatValuePriceImpact'
import { getPromiseFulfilledValue, isPromiseFulfilled } from 'utils/misc'
import { supportedChainId } from 'utils/supportedChainId'
import { getBestQuote, QuoteResult } from 'utils/price'

import { ZERO_ADDRESS } from 'constants/misc'
import { SupportedChainId } from 'constants/chains'
import { DEFAULT_DECIMALS } from 'constants/index'
import { useIsQuoteLoading, useQuoteDispatchers } from 'state/price/hooks'
import BigNumber from 'bignumber.js'

type ParsedAmounts = { INPUT: CurrencyAmount<Currency> | undefined; OUTPUT: CurrencyAmount<Currency> | undefined }

// TODO: fix type
export function useFiatValuePriceImpact(parsedAmounts: ParsedAmounts) {
  const fiatValueInput = useHigherUSDValue(parsedAmounts[Field.INPUT])
  const fiatValueOutput = useHigherUSDValue(parsedAmounts[Field.OUTPUT])
  const priceImpact = computeFiatValuePriceImpact(fiatValueInput, fiatValueOutput)

  return priceImpact
}

// calculates a new Quote and inverse swap values
// TODO: maybe move this to a new file
function useQuoteAndSwap({
  parsedAmount,
  outputCurrency,
  sellToken,
  buyToken,
  fromDecimals = DEFAULT_DECIMALS,
  toDecimals = DEFAULT_DECIMALS,
}: {
  parsedAmount?: CurrencyAmount<Currency>
  outputCurrency?: Currency
  sellToken?: string | null
  buyToken?: string | null
  fromDecimals?: number
  toDecimals?: number
}) {
  const { chainId: preChain } = useActiveWeb3React()
  const { account } = useWalletInfo()

  const [quote, setLocalQuote] = useState<QuoteInformationObject | undefined>()
  const { setQuoteLoading } = useQuoteDispatchers()

  const amount = parsedAmount?.quotient.toString()

  useEffect(() => {
    const chainId = supportedChainId(preChain)
    // bail out early - amount here is undefined if usd price impact is valid
    if (!sellToken || !buyToken || !amount) return

    const quoteParams = {
      amount,
      sellToken,
      buyToken,
      // B > A Trade is always a sell
      kind: OrderKind.SELL,
      fromDecimals,
      toDecimals,
      // TODO: check
      userAddress: account || ZERO_ADDRESS,
      chainId: chainId || SupportedChainId.MAINNET,
    }

    // set the quote loading indicator
    setQuoteLoading(true)

    getBestQuote({
      quoteParams,
      fetchFee: true,
      isPriceRefresh: false,
    })
      .then((quoteResp) => {
        const [price, fee] = quoteResp as QuoteResult

        const quoteData: QuoteInformationObject = {
          ...quoteParams,
          fee: getPromiseFulfilledValue(fee, undefined),
          price: getPromiseFulfilledValue(price, undefined),
          lastCheck: Date.now(),
        }
        // check the promise fulfilled values
        // handle if rejected
        if (!isPromiseFulfilled(fee)) {
          // fee error takes precedence
          throw fee.reason
        } else if (!isPromiseFulfilled(price)) {
          throw price.reason
        }

        // use a local state vs redux as redux state retriggers price updaters..
        // and we don't really care about the BA quote anyways
        setLocalQuote(quoteData)
      })
      .catch((err) => {
        console.error('[usePriceImpact] Error getting new quote:', err)
      })
      .finally(() => {
        setQuoteLoading(false)
      })
  }, [amount, account, preChain, buyToken, sellToken, toDecimals, fromDecimals, setQuoteLoading])

  // ABA is always sell trades
  // SELL >> SELL
  // BUY >> SELL
  const bestTradeExactIn = useTradeExactInWithFee({
    parsedAmount,
    outputCurrency,
    quote,
  })

  return bestTradeExactIn
}

interface AbaPriceImpactParams {
  abTrade?: TradeGp
  fiatPriceImpact?: Percent
}

function _calculateAbaPriceImpact(initialValue: string, finalValue: string) {
  const initialValueBn = new BigNumber(initialValue)
  const finalValueBn = new BigNumber(finalValue)
  // TODO: use correct formula
  // ((IV - FV) / IV / 2) * 100
  const [numerator, denominator] = initialValueBn.minus(finalValueBn).div(initialValueBn).div('2').toFraction()

  const priceImpactPercentage =
    // Uni sdk hates negative numbers so we need to do this
    numerator.isNegative() || denominator.isNegative()
      ? new Percent(numerator.absoluteValue().toString(10), denominator.absoluteValue().toString(10)).multiply('-1')
      : new Percent(numerator.toString(10), denominator.toString(10))

  // TODO: remove
  console.debug(`
    INITIAL: ${initialValueBn.toString(10)}
    FINAL: ${finalValueBn.toString(10)}
    ==
    PERCENT: ${priceImpactPercentage.toSignificant(2)}%
  `)

  return priceImpactPercentage
}

export function useAbaPriceImpact({ abTrade, fiatPriceImpact }: AbaPriceImpactParams) {
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
      const abaPriceImpact = _calculateAbaPriceImpact(isExactIn ? abIn : abOut, baOut)
      setPriceImpact(abaPriceImpact)
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

type PriceImpactParams = Omit<AbaPriceImpactParams, 'fiatPriceImpact'> & { parsedAmounts: ParsedAmounts }

export default function usePriceImpact({ abTrade, parsedAmounts }: PriceImpactParams) {
  /* const fiatPriceImpact =  */ useFiatValuePriceImpact(parsedAmounts)
  // TODO: this shouldnt be undefined, testing
  const abaPriceImpact = useAbaPriceImpact({ abTrade, fiatPriceImpact: undefined })

  return abaPriceImpact
}
