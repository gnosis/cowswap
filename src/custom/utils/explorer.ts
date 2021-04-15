import { ChainId } from '@uniswap/sdk'
import { OrderID } from 'utils/operator'
import { checkEnvironment } from './environments'

const { isDev, isStaging, isProd } = checkEnvironment(window.location.host)

function _getExplorerUrlByEnvironment() {
  let baseUrl: string | undefined
  if (isDev) {
    baseUrl = process.env.REACT_APP_EXPLORER_URL_DEV || 'https://protocol-explorer.dev.gnosisdev.com'
  } else if (isStaging) {
    baseUrl = process.env.REACT_APP_EXPLORER_URL_STAGING || 'https://protocol-explorer.staging.gnosisdev.com'
  } else if (isProd) {
    baseUrl = process.env.REACT_APP_EXPLORER_URL_PROD || 'https://gnosis-protocol.io'
  } else {
    // default to dev
    baseUrl = process.env.REACT_APP_EXPLORER_URL_DEV || 'https://protocol-explorer.dev.gnosisdev.com'
  }

  return {
    [ChainId.MAINNET]: baseUrl,
    [ChainId.RINKEBY]: `${baseUrl}/rinkeby`,
    [ChainId.XDAI]: `${baseUrl}/xdai`
  }
}

const EXPLORER_BASE_URL: Partial<Record<ChainId, string>> = _getExplorerUrlByEnvironment()

function _getExplorerBaseUrl(chainId: ChainId): string {
  const baseUrl = EXPLORER_BASE_URL[chainId]

  if (!baseUrl) {
    throw new Error('Unsupported Network. The operator API is not deployed in the Network ' + chainId)
  } else {
    return baseUrl
  }
}

export function getExplorerOrderLink(chainId: ChainId, orderId: OrderID): string {
  const baseUrl = _getExplorerBaseUrl(chainId)

  return baseUrl + `/orders/${orderId}`
}
