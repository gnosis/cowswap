import { useEffect, useState } from 'react'
import { OrderKind } from '@gnosis.pm/gp-v2-contracts'
import { Currency, CurrencyAmount, Percent } from '@uniswap/sdk-core'

import { useTradeExactInWithFee, useTradeExactOutWithFee } from 'state/swap/extension'
import { tryParseAmount, useSwapState } from 'state/swap/hooks'
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

import { ONE_BIPS, ZERO_ADDRESS } from 'constants/misc'
import { SupportedChainId } from 'constants/chains'
import { DEFAULT_DECIMALS } from 'constants/index'

// TODO: calculate actual price impact from ABA
const HARD_CODED_PRICE_IMPACT = ONE_BIPS

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
function useQuoteAndInverseSwap({
  typedValue,
  outputCurrency,
  inputCurrency,
}: {
  typedValue?: string
  outputCurrency?: Currency
  inputCurrency?: Currency
}) {
  const [quote, setQuote] = useState<QuoteInformationObject | undefined>()

  const { chainId: preChain } = useActiveWeb3React()
  const { account } = useWalletInfo()

  const {
    INPUT: { currencyId: sellToken },
    OUTPUT: { currencyId: buyToken },
    independentField,
  } = useSwapState()

  const isExactIn = independentField === Field.INPUT

  const parsedAmount = tryParseAmount(typedValue, (isExactIn ? inputCurrency : outputCurrency) ?? undefined)
  const amount = parsedAmount?.quotient.toString()
  const fromDecimals = outputCurrency?.decimals ?? DEFAULT_DECIMALS
  const toDecimals = inputCurrency?.decimals ?? DEFAULT_DECIMALS

  // uwc-debug
  useEffect(() => {
    const chainId = supportedChainId(preChain)
    if (!sellToken || !buyToken || !amount) return

    const quoteParams = {
      amount,
      // Invert these
      sellToken: buyToken,
      buyToken: sellToken,
      kind: isExactIn ? OrderKind.SELL : OrderKind.BUY,
      fromDecimals,
      toDecimals,
      // TODO: check
      userAddress: account || ZERO_ADDRESS,
      chainId: chainId || SupportedChainId.MAINNET,
    }

    getBestQuote({
      quoteParams,
      fetchFee: true,
      isPriceRefresh: false,
    })
      .then((quote) => {
        const [price, fee] = quote as QuoteResult

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

        setQuote(quoteData)
      })
      .catch((err) => {
        console.error(err)
      })
  }, [account, amount, buyToken, fromDecimals, isExactIn, preChain, sellToken, toDecimals, typedValue])

  const bestTradeExactIn = useTradeExactInWithFee({
    parsedAmount: isExactIn ? parsedAmount : undefined,
    outputCurrency,
    quote,
  })
  const bestTradeExactOut = useTradeExactOutWithFee({
    parsedAmount: isExactIn ? undefined : parsedAmount,
    inputCurrency,
    quote,
  })

  return isExactIn ? bestTradeExactIn : bestTradeExactOut
}

interface AbaPriceImpactParams {
  abTrade?: TradeGp
  fiatPriceImpact?: Percent
}

export function useAbaPriceImpact({ abTrade, fiatPriceImpact }: AbaPriceImpactParams) {
  const [abaPriceImpact, setAbaPriceImpact] = useState<Percent | undefined>(undefined)

  // we calculate the trade going B > A
  // using the output values from the original A > B trade
  const baTrade = useQuoteAndInverseSwap({
    // the amount traded now is the A > B output amount without fees
    // TODO: is this the amount with or without fees?
    typedValue: abTrade?.outputAmountWithoutFee?.toExact(),
    inputCurrency: abTrade?.inputAmount.currency,
    outputCurrency: abTrade?.outputAmount.currency,
  })

  useEffect(() => {
    // we have no fiat price impact and there's a trade, we need to use ABA impact
    if (abTrade && baTrade && !fiatPriceImpact) {
      setAbaPriceImpact(HARD_CODED_PRICE_IMPACT)
    }
  }, [fiatPriceImpact, abTrade, baTrade])

  // TODO: remove - debugging
  useEffect(() => {
    console.debug('[usePriceImpact] >> A > B TRADE', abTrade)
    console.debug('[usePriceImpact] >> B > A TRADE', baTrade)
  }, [abTrade, baTrade])

  return abaPriceImpact
}

type PriceImpactParams = Omit<AbaPriceImpactParams, 'fiatPriceImpact'> & { parsedAmounts: ParsedAmounts }

export default function usePriceImpact({ abTrade, parsedAmounts }: PriceImpactParams) {
  const fiatPriceImpact = useFiatValuePriceImpact(parsedAmounts)
  const abaPriceImpact = useAbaPriceImpact({ abTrade, fiatPriceImpact: undefined })
  // TODO: remove - debugging
  console.debug(`
  [usePriceImpact] >>
    PRICE IMPACTS
    =============
    FIAT: ${fiatPriceImpact?.toSignificant(2)}
    ABA:  ${abaPriceImpact?.toSignificant(2)}
`)
  return null || abaPriceImpact
}
