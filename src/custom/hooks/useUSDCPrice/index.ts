import { CurrencyAmount, Currency, Price, Token } from '@uniswap/sdk-core'
import { useEffect, useMemo, useState } from 'react'
import { unstable_batchedUpdates as batchedUpdate } from 'react-dom'
import { supportedChainId } from 'utils/supportedChainId'
import { useActiveWeb3React } from 'hooks/web3'
import { getBestPrice } from 'utils/price'
import { STABLECOIN_AMOUNT_OUT } from 'hooks/useUSDCPrice'
import { stringToCurrency } from 'state/swap/extension'

export * from '@src/hooks/useUSDCPrice'
export { default } from '@src/hooks/useUSDCPrice'

export function useBestUSDCPrice(currency?: Currency) {
  const [bestUsdPrice, setBestUsdPrice] = useState<Price<Token, Currency> | null>(null)
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

    getBestPrice(params, { aggrOverride: 'max' })
      .then((winningPrice) => {
        // Response can include a null price amount, throw if so
        if (!winningPrice.amount) throw new Error('Winning price cannot be null')

        // reset the error
        setError(null)

        let price: Price<Token, Token> | Price<Token, Currency>
        // handle tokens being the same
        if (currency.wrapped.equals(stablecoin)) {
          price = new Price(stablecoin, stablecoin, '1', '1')
        } else {
          price = new Price({ baseAmount: amountOut, quoteAmount: stringToCurrency(winningPrice.amount, currency) })
        }
        console.debug(
          '[useBestUSDCPrice] Best USDC price amount',
          price.toSignificant(12),
          price.invert().toSignificant(12)
        )
        setBestUsdPrice(price)
      })
      .catch((err) => {
        console.error('[useBestUSDCPrice] Error getting best price', err)
        return batchedUpdate(() => {
          setError(new Error(err))
          setBestUsdPrice(null)
        })
      })
  }, [amountOut, chainId, currency, stablecoin])

  return { price: bestUsdPrice, error }
}

/**
 * Returns the price in USDC of the input currency from price APIs
 * @param currency currency to compute the USDC price of
 */
export function useBestUSDCValue(currencyAmount?: CurrencyAmount<Currency>) {
  const { price, error } = useBestUSDCPrice(currencyAmount?.currency)

  return useMemo(() => {
    if (!price || error || !currencyAmount) return null

    try {
      return price.invert().quote(currencyAmount)
    } catch (error) {
      return null
    }
  }, [currencyAmount, error, price])
}
