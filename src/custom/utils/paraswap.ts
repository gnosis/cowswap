import { OrderKind } from '@gnosis.pm/gp-v2-contracts'
import { ParaSwap, SwapSide, NetworkID } from 'paraswap'
import { toErc20Address } from 'utils/tokens'
import { PriceQuoteParams } from 'utils/operator'
import { OptimalRatesWithPartnerFees, RateOptions } from 'paraswap/build/types'
import { ChainId } from '@uniswap/sdk'
import { PriceInformation } from 'state/price/reducer'

type ParaSwapPriceQuote = OptimalRatesWithPartnerFees

// Provided manually just to make sure it matches what GPv2 backend is using, although the value used  is the current SDK default
const API_URL = 'https://apiv4.paraswap.io/v2'

const parSwapLibs: Map<ChainId, ParaSwap> = new Map()

function getParaswapChainId(chainId: ChainId): NetworkID | null {
  switch (chainId) {
    case ChainId.MAINNET:
    // case ChainId.RINKEBY: // Rinkeby is supported by the SDK but not from the API
    // case ChainId.XDAI: // xDAI not supported for now
    case ChainId.KOVAN:
    case ChainId.ROPSTEN:
      return chainId

    default:
      // Unsupported network
      return null
  }
}

export function toPriceInformation(priceRaw: ParaSwapPriceQuote | null): PriceInformation | null {
  console.log('toPriceInformation', priceRaw)
  if (!priceRaw) {
    return null
  }

  return {
    amount: priceRaw.destAmount,
    token: priceRaw.details?.tokenTo || 'anxo'
  }
}

export async function getPriceQuote(params: PriceQuoteParams): Promise<ParaSwapPriceQuote | null> {
  const { baseToken, quoteToken, amount, kind, chainId } = params

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
  const sellToken = toErc20Address(baseToken, chainId)
  const buyToken = toErc20Address(quoteToken, chainId)
  const swapSide = kind === OrderKind.BUY ? SwapSide.BUY : SwapSide.SELL
  const options: RateOptions | undefined = undefined
  const rateResult = await paraSwap.getRate(sellToken, buyToken, amount, swapSide, options)

  if ('destAmount' in rateResult) {
    // Success: rateResult is an OptimalRatesWithPartnerFees
    return rateResult
  } else {
    // Error: rateResult is an ApiError
    throw rateResult
  }
}
