import { useEffect, useState } from 'react'
import { OrderKind } from '@gnosis.pm/gp-v2-contracts'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { useTradeExactInWithFee } from 'state/swap/extension'
import { QuoteInformationObject } from 'state/price/reducer'

import { useWalletInfo } from 'hooks/useWalletInfo'
import { useActiveWeb3React } from 'hooks/web3'

import { getPromiseFulfilledValue, isPromiseFulfilled } from 'utils/misc'
import { supportedChainId } from 'utils/supportedChainId'
import { getBestQuote, QuoteResult } from 'utils/price'

import { ZERO_ADDRESS } from 'constants/misc'
import { SupportedChainId } from 'constants/chains'
import { DEFAULT_DECIMALS } from 'constants/index'
import { useQuoteDispatchers } from 'state/price/hooks'

// calculates a new Quote and inverse swap values
export default function useQuoteAndSwap({
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
