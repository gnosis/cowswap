import { CurrencyAmount, Currency, Price, Token } from '@uniswap/sdk-core'
import { useEffect, useMemo, useState } from 'react'
import { unstable_batchedUpdates as batchedUpdate } from 'react-dom'
import { getBestPriceQuote } from 'utils/operator'
import { supportedChainId } from 'utils/supportedChainId'
import { useActiveWeb3React } from 'hooks/web3'
import {
  extractPriceAndErrorPromiseValues,
  filterWinningPrice,
  PriceQuoteError,
} from '../useRefetchPriceCallback/utils'
import { STABLECOIN_AMOUNT_OUT } from 'hooks/useUSDCPrice'

export * from '@src/hooks/useUSDCPrice'
export { default } from '@src/hooks/useUSDCPrice'

export function useBestGpUSDCPrice(currency?: Currency) {
  const [bestUsdPrice, setBestUsdPrice] = useState<Price<Currency, Token> | null>(null)
  const [error, setError] = useState<Error | null>(null)

  const { chainId } = useActiveWeb3React()

  // USDC constants
  // 100_000e6 USDC @ 6 decimals
  const amountOut = chainId ? STABLECOIN_AMOUNT_OUT[chainId] : undefined
  const stablecoin = amountOut?.currency

  useEffect(() => {
    const isSupportedChain = supportedChainId(chainId)
    if (!isSupportedChain || !currency || !amountOut || !stablecoin) return

    const params = {
      baseToken: stablecoin.address,
      quoteToken: currency.wrapped.address,
      kind: 'buy',
      amount: amountOut.quotient.toString(),
      chainId: isSupportedChain,
      fromDecimals: currency.decimals,
      toDecimals: stablecoin.decimals,
    }

    getBestPriceQuote(params)
      .then(([gpPrice, paraswapPrice]) => {
        setError(null)

        const [priceQuotes] = extractPriceAndErrorPromiseValues(gpPrice, paraswapPrice)
        const amounts = priceQuotes.reduce<string[]>((acc, { amount }) => (amount ? acc.concat(amount) : acc), [])

        if (!priceQuotes.length) {
          throw new PriceQuoteError('Error querying price from APIs', params, [gpPrice, paraswapPrice])
        }

        // TODO: check if we need to get "lowest" usdc price
        // normally this function is for setting the better price quote
        // but it stands that we need to pick a price at the end between the multiple sources
        const winningPrice = filterWinningPrice({
          kind: 'buy',
          priceQuotes,
          amounts,
        })

        let price = new Price(currency, stablecoin, amountOut.quotient, winningPrice.amount)
        // handle usdc
        if (currency.wrapped.equals(stablecoin)) {
          price = new Price(stablecoin, stablecoin, '1', '1')
        }

        setBestUsdPrice(price)
      })
      .catch((err) => {
        console.error('[useBestGpUSDCPrice] Error getting best price', err)
        return batchedUpdate(() => {
          setError(new Error(err))
          setBestUsdPrice(null)
        })
      })
  }, [amountOut, chainId, currency, stablecoin])

  return { price: bestUsdPrice, error }
}

/**
 * Returns the price in USDC of the input currency from Gp APIs
 * @param currency currency to compute the USDC price of
 */
export function useGpUSDCValue(currencyAmount?: CurrencyAmount<Currency>) {
  const { price, error } = useBestGpUSDCPrice(currencyAmount?.currency)

  return useMemo(() => {
    if (!price || error || !currencyAmount) return null

    try {
      return price.quote(currencyAmount)
    } catch (error) {
      return null
    }
  }, [currencyAmount, error, price])
}
