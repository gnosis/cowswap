import { CurrencyAmount, Currency, Price, Token } from '@uniswap/sdk-core'
import { useEffect, useMemo, useState } from 'react'
import { unstable_batchedUpdates as batchedUpdate } from 'react-dom'
import { supportedChainId } from 'utils/supportedChainId'
import { useActiveWeb3React } from 'hooks/web3'
import { getBestPrice } from 'utils/price'
import { STABLECOIN_AMOUNT_OUT as STABLECOIN_AMOUNT_OUT_UNI } from 'hooks/useUSDCPrice'
import { stringToCurrency } from 'state/swap/extension'
import { SupportedChainId } from 'constants/chains'
import { USDC_XDAI } from 'utils/xdai/constants'
import { OrderKind } from 'state/orders/actions'
import { CoinGeckoUsdPriceParams, getUSDPriceQuote, toPriceInformation } from 'api/coingecko'
import { tryParseAmount } from 'state/swap/hooks'
import { DEFAULT_NETWORK_FOR_LISTS } from 'constants/lists'
import { useToken } from 'hooks/Tokens'
import { currencyId } from 'utils/currencyId'
import { parseUnits } from 'ethers/lib/utils'

export * from '@src/hooks/useUSDCPrice'

const STABLECOIN_AMOUNT_OUT: { [chainId: number]: CurrencyAmount<Token> } = {
  ...STABLECOIN_AMOUNT_OUT_UNI,
  [SupportedChainId.XDAI]: CurrencyAmount.fromRawAmount(USDC_XDAI, 10_000e6),
}

export default function useUSDCPrice(currency?: Currency) {
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

interface GetPriceQuoteParams {
  currencyAmount?: CurrencyAmount<Currency>
  error: Error | null
  price: Price<Token, Currency> | null
}

// common logic for returning price quotes
function useGetPriceQuote({ price, error, currencyAmount }: GetPriceQuoteParams) {
  return useMemo(() => {
    if (!price || error || !currencyAmount) return null

    try {
      return price.invert().quote(currencyAmount)
    } catch (error) {
      return null
    }
  }, [currencyAmount, error, price])
}

/**
 * Returns the price in USDC of the input currency from price APIs
 * @param currencyAmount currency to compute the USDC price of
 */
export function useUSDCValue(currencyAmount?: CurrencyAmount<Currency>) {
  const usdcPrice = useUSDCPrice(currencyAmount?.currency)

  return useGetPriceQuote({ ...usdcPrice, currencyAmount })
}

export function useCoingeckoUsdPrice({ tokenAddress }: Pick<CoinGeckoUsdPriceParams, 'tokenAddress'>) {
  // default to MAINNET (if disconnected e.g)
  const { chainId = DEFAULT_NETWORK_FOR_LISTS } = useActiveWeb3React()
  const [price, setPrice] = useState<Price<Token, Currency> | null>(null)
  const [error, setError] = useState<Error | null>(null)

  const currency = useToken(tokenAddress)

  useEffect(() => {
    getUSDPriceQuote({
      chainId,
      tokenAddress,
    })
      .then(toPriceInformation)
      .then((response) => {
        if (!currency || !response?.amount) return

        const { amount } = response
        // api returns base units, we want atoms and CurrencyAmount
        const usdParsed = tryParseAmount(amount.toString(), currency)
        // parse failure is unlikely - type safe
        if (!usdParsed) return

        // create a new Price object
        const usdPrice = new Price({
          quoteAmount: CurrencyAmount.fromRawAmount(
            usdParsed.currency,
            // we use 1 as the denominator
            parseUnits('1', usdParsed.currency.decimals).toString()
          ),
          baseAmount: usdParsed,
        })

        console.debug(
          '[useCoingeckoUsdPrice] Best Coingecko USD price amount',
          usdPrice.toSignificant(12),
          usdPrice.invert().toSignificant(12)
        )

        setPrice(usdPrice)
      })
      .catch((error) => {
        console.error(
          '[useUSDCPrice::useCoingeckoUsdPrice]::Error getting USD price from Coingecko for token',
          tokenAddress,
          error
        )
        return batchedUpdate(() => {
          setError(new Error(error))
          setPrice(null)
        })
      })
  }, [chainId, currency, tokenAddress])

  return { price, error }
}

type CoinGeckoUsdValueParams = Pick<CoinGeckoUsdPriceParams, 'tokenAddress'> & {
  currencyAmount?: CurrencyAmount<Currency>
}

export function useCoingeckoUSDValue(params: CoinGeckoUsdValueParams) {
  const { currencyAmount } = params
  const coingeckoUsdPrice = useCoingeckoUsdPrice(params)

  return useGetPriceQuote({ ...coingeckoUsdPrice, currencyAmount })
}

export function useHigherUSDValue(currencyAmount: CurrencyAmount<Currency> | undefined) {
  const usdcValue = useUSDCValue(currencyAmount)
  const coingeckoUsdPrice = useCoingeckoUSDValue({
    tokenAddress: currencyAmount ? currencyId(currencyAmount.currency) : '',
    currencyAmount,
  })

  return useMemo(() => {
    // USDC PRICE UNAVAILABLE
    if (!usdcValue && coingeckoUsdPrice) {
      return coingeckoUsdPrice
      // COINGECKO PRICE UNAVAILABLE
    } else if (usdcValue && !coingeckoUsdPrice) {
      return usdcValue
      // BOTH AVAILABLE
    } else if (usdcValue && coingeckoUsdPrice) {
      // take the greater of the 2 values
      return usdcValue.greaterThan(coingeckoUsdPrice) ? usdcValue : coingeckoUsdPrice
    } else {
      return null
    }
  }, [usdcValue, coingeckoUsdPrice])
}
