import { OrderKind } from '@gnosis.pm/gp-v2-contracts'
import { ParaSwap, SwapSide, NetworkID } from 'paraswap'
import { toErc20Address } from 'utils/tokens'
import { PriceQuoteParams } from 'utils/operator'
import { OptimalRatesWithPartnerFees, RateOptions } from 'paraswap/build/types'
import { ChainId } from '@uniswap/sdk'
import { PriceInformation } from 'state/price/reducer'
import { getTokensFromMarket } from './misc'

type ParaSwapPriceQuote = OptimalRatesWithPartnerFees

// Provided manually just to make sure it matches what GPv2 backend is using, although the value used  is the current SDK default
const API_URL = 'https://apiv4.paraswap.io/v2'

const parSwapLibs: Map<ChainId, ParaSwap> = new Map()

function getParaswapChainId(chainId: ChainId): NetworkID | null {
  switch (chainId) {
    // case ChainId.RINKEBY: // Rinkeby is supported by the SDK but not from the API
    // case ChainId.XDAI: // xDAI not supported for now
    case ChainId.MAINNET:
    case ChainId.KOVAN:
    case ChainId.ROPSTEN:
      return chainId

    default:
      // Unsupported network
      return null
  }
}

export function toPriceInformation(priceRaw: ParaSwapPriceQuote | null): PriceInformation | null {
  if (!priceRaw || !priceRaw.details) {
    return null
  }

  const { destAmount, srcAmount, details, side } = priceRaw
  if (side === SwapSide.SELL) {
    return {
      amount: destAmount,
      token: details.tokenTo
    }
  } else {
    return {
      amount: srcAmount,
      token: details.tokenFrom
    }
  }
}

export async function getPriceQuote(params: PriceQuoteParams): Promise<ParaSwapPriceQuote | null> {
  const { baseToken: baseTokenAux, quoteToken: quoteTokenAux, amount, kind, chainId } = params
  const baseToken = toErc20Address(baseTokenAux, chainId)
  const quoteToken = toErc20Address(quoteTokenAux, chainId)

  let paraSwap = parSwapLibs.get(chainId)
  if (!paraSwap) {
    const networkId = getParaswapChainId(chainId)
    if (networkId == null) {
      // Unsupported network
      return null
    }
    paraSwap = new ParaSwap(networkId, API_URL)
    parSwapLibs.set(chainId, paraSwap)
  }

  console.log('[util:paraswap] Get price from Paraswap', params)

  // Buy/sell token and side (sell/buy)
  const { sellToken, buyToken } = getTokensFromMarket({ baseToken, quoteToken, kind })
  const swapSide = kind === OrderKind.BUY ? SwapSide.BUY : SwapSide.SELL

  // https://developers.paraswap.network/api/get-rate-for-a-token-pair
  const options: RateOptions | undefined = undefined

  // Get price
  const rateResult = await paraSwap.getRate(sellToken, buyToken, amount, swapSide, options)

  if ('destAmount' in rateResult) {
    // Success: rateResult is an OptimalRatesWithPartnerFees
    return rateResult
  } else {
    // Error: rateResult is an ApiError
    throw rateResult
  }
}
