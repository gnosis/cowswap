import { CurrencyAmount, Currency, Price, Token } from '@uniswap/sdk-core'
import { useEffect, useMemo, useState } from 'react'
import { SupportedChainId } from 'constants/chains'
/* import { DAI_OPTIMISM, USDC, USDC_ARBITRUM } from '../constants/tokens'
import { useV2TradeExactOut } from './useV2Trade'
import { useBestV3TradeExactOut } from './useBestV3Trade' */
import { useActiveWeb3React } from 'hooks/web3'

import { supportedChainId } from 'utils/supportedChainId'
import { getBestPrice } from 'utils/price'
import { STABLECOIN_AMOUNT_OUT as STABLECOIN_AMOUNT_OUT_UNI } from 'hooks/useUSDCPrice'
import { stringToCurrency } from 'state/swap/extension'
import { USDC_XDAI } from 'utils/xdai/constants'
import { OrderKind } from 'state/orders/actions'
import { unstable_batchedUpdates as batchedUpdate } from 'react-dom'

export * from '@src/hooks/useUSDCPrice'

const STABLECOIN_AMOUNT_OUT: { [chainId: number]: CurrencyAmount<Token> } = {
  ...STABLECOIN_AMOUNT_OUT_UNI,
  [SupportedChainId.XDAI]: CurrencyAmount.fromRawAmount(USDC_XDAI, 10_000e6),
}

/**
 * Returns the price in USDC of the input currency
 * @param currency currency to compute the USDC price of
 */
export default function useUSDCPrice(currency?: Currency) {
  const [bestUsdPrice, setBestUsdPrice] = useState<Price<Token, Currency> | null>(null)
  const [error, setError] = useState<Error | null>(null)

  const { chainId } = useActiveWeb3React()

  const amountOut = chainId ? STABLECOIN_AMOUNT_OUT[chainId] : undefined
  const stablecoin = amountOut?.currency

  /* 
  const v2USDCTrade = useV2TradeExactOut(currency, amountOut, {
    maxHops: 2,
  })
  const v3USDCTrade = useBestV3TradeExactOut(currency, amountOut)

  return useMemo(() => {
    if (!currency || !stablecoin) {
      return undefined
    }

    // handle usdc
    if (currency?.wrapped.equals(stablecoin)) {
      return new Price(stablecoin, stablecoin, '1', '1')
    }

    // use v2 price if available, v3 as fallback
    if (v2USDCTrade) {
      const { numerator, denominator } = v2USDCTrade.route.midPrice
      return new Price(currency, stablecoin, denominator, numerator)
    } else if (v3USDCTrade.trade) {
      const { numerator, denominator } = v3USDCTrade.trade.route.midPrice
      return new Price(currency, stablecoin, denominator, numerator)
    }

    return undefined
  }, [currency, stablecoin, v2USDCTrade, v3USDCTrade.trade]) 
  */

  useEffect(() => {
    const isSupportedChain = supportedChainId(chainId)
    if (!isSupportedChain || !currency || !amountOut || !stablecoin) return

    const params = {
      baseToken: stablecoin.address,
      quoteToken: currency.wrapped.address,
      kind: OrderKind.BUY,
      amount: amountOut.quotient.toString(),
      chainId: isSupportedChain,
      fromDecimals: currency.decimals,
      toDecimals: stablecoin.decimals,
    }

    if (currency.wrapped.equals(stablecoin)) {
      const price = new Price(stablecoin, stablecoin, '1', '1')
      return setBestUsdPrice(price)
    } else {
      getBestPrice(params)
        .then((winningPrice) => {
          // reset the error
          setError(null)

          let price: Price<Token, Currency> | null
          // Response can include a null price amount
          // e.g fee > input error
          if (!winningPrice.amount) {
            price = null
          } else {
            price = new Price({
              baseAmount: amountOut,
              quoteAmount: stringToCurrency(winningPrice.amount, currency),
            })
            console.debug(
              '[useBestUSDCPrice] Best USDC price amount',
              price.toSignificant(12),
              price.invert().toSignificant(12)
            )
          }

          return setBestUsdPrice(price)
        })
        .catch((err) => {
          console.error('[useBestUSDCPrice] Error getting best price', err)
          return batchedUpdate(() => {
            setError(new Error(err))
            setBestUsdPrice(null)
          })
        })
    }
  }, [amountOut, chainId, currency, stablecoin])

  return { price: bestUsdPrice, error }
}

/**
 * Returns the price in USDC of the input currency from price APIs
 * @param currencyAmount currency to compute the USDC price of
 */
export function useUSDCValue(currencyAmount?: CurrencyAmount<Currency>) {
  const { price, error } = useUSDCPrice(currencyAmount?.currency)

  return useMemo(() => {
    // if (!price || !currencyAmount) return null
    if (!price || error || !currencyAmount) return null

    try {
      // return price.quote(currencyAmount)
      return price.invert().quote(currencyAmount)
    } catch (error) {
      return null
    }
    // }, [currencyAmount, price])
  }, [currencyAmount, error, price])
}
