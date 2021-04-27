import { ChainId } from '@uniswap/sdk'
import { BigNumber } from 'ethers'
import { UpdateGasPrices } from 'state/gas/actions'
import { DEFAULT_NETWORK_FOR_LISTS } from 'constants/lists'
import { fetchData, promiseFirstResolved } from '.'
import { getChainIdValues } from './misc'
import { parseUnits } from 'ethers/lib/utils'

export enum GasPriceSources {
  SAFE = 'SAFE',
  INFURA = 'INFURA'
}

export interface GasPriceEndpointData {
  source: GasPriceSources
  options?: RequestInit
  urls: { [chain in ChainId]: string }
}

export function chainIdToGasLabel(chainId: ChainId) {
  switch (chainId) {
    case ChainId.RINKEBY:
      return 'rinkeby'
    case ChainId.GÖRLI:
      return 'goerli'
    default:
      return 'mainnet'
  }
}

// safe relay endpoint
export const GAS_FEE_ENDPOINTS: GasPriceEndpointData = {
  source: GasPriceSources.SAFE,
  urls: getChainIdValues().reduce((memo, chainId) => {
    memo[chainId] = `https://safe-relay.${chainIdToGasLabel(chainId)}.gnosis.io/api/v1/gas-station/`
    return memo
  }, {} as GasPriceEndpointData['urls'])
}

const ETH_GAS_PRICE_REQUEST = JSON.stringify({ jsonrpc: '2.0', method: 'eth_gasPrice', params: [], id: 1 })

// infura gasPrice endpoint
export const GAS_FEE_ENDPOINTS_BACKUP: GasPriceEndpointData = {
  source: GasPriceSources.INFURA,
  options: {
    method: 'POST',
    body: ETH_GAS_PRICE_REQUEST
  },
  urls: getChainIdValues().reduce((memo, chainId) => {
    memo[chainId] = `https://${chainIdToGasLabel(chainId)}.infura.io/v3/27b1a8a99c49447e83d918dad2cb46e9`
    return memo
  }, {} as GasPriceEndpointData['urls'])
}

export const GAS_FEE_FALLBACK = {
  lastUpdate: new Date().toString(),
  // format to GWEI
  price: parseUnits('50', 'gwei').toString()
}

export const GAS_FEE_ENDPOINT_OPTIONS = [GAS_FEE_ENDPOINTS, GAS_FEE_ENDPOINTS_BACKUP]

async function _normaliseGasResponse({
  options,
  response
}: {
  options: typeof GAS_FEE_ENDPOINT_OPTIONS
  response: {
    id: number | null
    result: Response | null
  }
}): Promise<UpdateGasPrices> {
  // no response data - fallback
  if (response.result === null || response.id === null) return GAS_FEE_FALLBACK

  const { result, id } = response
  const gasPrices = await result.json()

  // get the gas api source
  // and normalise data as necessary
  const { source } = options[id]
  switch (source) {
    case GasPriceSources.SAFE:
      return { lastUpdate: gasPrices.lastUpdate, price: gasPrices.standard }
    case GasPriceSources.INFURA:
      return { lastUpdate: new Date().toString(), price: BigNumber.from(gasPrices.result).toString() }
    default:
      return GAS_FEE_FALLBACK
  }
}

// in case all API endpoints are down
export async function fetchGasPrices(
  chainId: ChainId | undefined = DEFAULT_NETWORK_FOR_LISTS
): Promise<UpdateGasPrices> {
  // map each endpoint map to a function
  const options = GAS_FEE_ENDPOINT_OPTIONS.map(({ urls, options }) => () => fetchData(urls[chainId], options))
  // cast fallback gas to a response format
  // const fallbackResponse = new Response(JSON.stringify(GAS_FEE_FALLBACK))
  // get first resolving promise
  const response = await promiseFirstResolved<Response>(options)
  // we need to check the response as endpoint return different values 🙄🙄
  // is infura endpoint response, for example
  return _normaliseGasResponse({ options: GAS_FEE_ENDPOINT_OPTIONS, response })
}
