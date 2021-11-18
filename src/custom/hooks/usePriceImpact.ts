import { useEffect, useState } from 'react'
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
function useQuoteAndInverseSwap({
  parsedAmount,
  outputCurrency,
  inputCurrency,
  sellToken,
  buyToken,
}: {
  parsedAmount?: CurrencyAmount<Currency>
  outputCurrency?: Currency
  inputCurrency?: Currency
  sellToken?: string | null
  buyToken?: string | null
}) {
  const [quote, setQuote] = useState<QuoteInformationObject | undefined>()

  const { chainId: preChain } = useActiveWeb3React()
  const { account } = useWalletInfo()

  const amount = parsedAmount?.quotient.toString()
  const fromDecimals = outputCurrency?.decimals ?? DEFAULT_DECIMALS
  const toDecimals = inputCurrency?.decimals ?? DEFAULT_DECIMALS

  // uwc-debug
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

export function useAbaPriceImpact({ abTrade, fiatPriceImpact }: AbaPriceImpactParams) {
  const [abaPriceImpact, setAbaPriceImpact] = useState<Percent | undefined>(undefined)
  const {
    INPUT: { currencyId: sellToken },
    OUTPUT: { currencyId: buyToken },
  } = useSwapState()
  const isExactIn = abTrade?.tradeType === TradeType.EXACT_INPUT
  // we calculate the trade going B > A
  // using the output values from the original A > B trade
  const baTrade = useQuoteAndInverseSwap({
    // the amount traded now is the A > B output amount without fees
    // TODO: is this the amount with or without fees?
    parsedAmount: isExactIn ? abTrade?.outputAmount : abTrade?.inputAmount,
    inputCurrency: abTrade?.inputAmount.currency,
    outputCurrency: abTrade?.outputAmount.currency,
    // on buy orders we dont inverse it
    sellToken: isExactIn ? buyToken : sellToken,
    buyToken: isExactIn ? sellToken : buyToken,
  })

  useEffect(() => {
    // we have no fiat price impact and there's a trade, we need to use ABA impact
    if (abTrade && baTrade && !fiatPriceImpact) {
      isExactIn
        ? console.debug(`
        [usePriceImpact::INPUT/OUTPUT]
        INITIAL INPUT:  ${abTrade.inputAmount.toExact()}
        FINAL OUTPUT:   ${baTrade.outputAmount?.toExact()}
      `)
        : console.debug(`
      [usePriceImpact::INPUT/OUTPUT]
      INITIAL OUTPUT:  ${abTrade.outputAmount.toExact()}
      FINAL OUTPUT:   ${baTrade.outputAmount?.toExact()}
    `)
      setAbaPriceImpact(HARD_CODED_PRICE_IMPACT)
    }
  }, [fiatPriceImpact, abTrade, baTrade, isExactIn])

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
  // TODO: this shouldnt be undefined, testing
  const abaPriceImpact = useAbaPriceImpact({ abTrade, fiatPriceImpact: undefined })
  // TODO: remove - debugging
  console.debug(`
  [usePriceImpact] >>
    PRICE IMPACTS
    =============
    FIAT: ${fiatPriceImpact?.toSignificant(2)}
    ABA:  ${abaPriceImpact?.toSignificant(2)}
`)
  return fiatPriceImpact || abaPriceImpact
}
