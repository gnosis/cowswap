import { useEffect, useRef, useState } from 'react'
import { OrderKind } from '@gnosis.pm/gp-v2-contracts'
import { Currency, CurrencyAmount, Percent, TradeType } from '@uniswap/sdk-core'

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
  const [quote, setQuote] = useState<QuoteInformationObject | undefined>()

  const { chainId: preChain } = useActiveWeb3React()
  const { account } = useWalletInfo()

  const amount = parsedAmount?.quotient.toString()

  useEffect(() => {
    const chainId = supportedChainId(preChain)
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
  }, [account, amount, buyToken, fromDecimals, preChain, sellToken, toDecimals])

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

function _calculateAbaPriceImpact(abTrade: TradeGp, baTrade: TradeGp, isExactIn: boolean) {
  console.debug('abTrade', abTrade, 'baTrade', baTrade, isExactIn)

  return HARD_CODED_PRICE_IMPACT
}

export function useAbaPriceImpact({ abTrade, fiatPriceImpact }: AbaPriceImpactParams) {
  const {
    INPUT: { currencyId: sellToken },
    OUTPUT: { currencyId: buyToken },
  } = useSwapState()
  const isExactIn = abTrade?.tradeType === TradeType.EXACT_INPUT
  // we calculate the trade going B > A
  // using the output values from the original A > B trade
  const baTrade = useQuoteAndSwap({
    // the amount traded now is the A > B output amount without fees
    // TODO: is this the amount with or without fees?
    parsedAmount: isExactIn ? abTrade?.outputAmount : abTrade?.inputAmount,
    // for the B > A SELL/SELL trade, the outputCurrency is the original input
    // for the B > A BUY/SELL trade, the outputCurrency is the original output
    outputCurrency: isExactIn ? abTrade?.inputAmount.currency : abTrade?.outputAmount.currency,
    // on buy orders we dont inverse it
    sellToken: isExactIn ? buyToken : sellToken,
    buyToken: isExactIn ? sellToken : buyToken,
    fromDecimals: isExactIn ? abTrade?.outputAmount.currency.decimals : abTrade?.inputAmount.currency.decimals,
    toDecimals: isExactIn ? abTrade?.inputAmount.currency.decimals : abTrade?.outputAmount.currency.decimals,
  })

  // ref to not recalc useEffect
  const abaPriceImpactRef = useRef<Percent | undefined>()

  useEffect(() => {
    // we have no fiat price impact and there's a trade, we need to use ABA impact
    if (abTrade && baTrade && !fiatPriceImpact) {
      const abaPriceImpact = _calculateAbaPriceImpact(abTrade, baTrade, isExactIn)
      abaPriceImpactRef.current = abaPriceImpact
    }
  }, [fiatPriceImpact, abTrade, baTrade, isExactIn])

  return abaPriceImpactRef.current
}

type PriceImpactParams = Omit<AbaPriceImpactParams, 'fiatPriceImpact'> & { parsedAmounts: ParsedAmounts }

export default function usePriceImpact({ abTrade, parsedAmounts }: PriceImpactParams) {
  const fiatPriceImpact = useFiatValuePriceImpact(parsedAmounts)
  // TODO: this shouldnt be undefined, testing
  const abaPriceImpact = useAbaPriceImpact({ abTrade, fiatPriceImpact: undefined })

  return fiatPriceImpact || abaPriceImpact
}
