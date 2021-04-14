import { ChainId } from '@uniswap/sdk'
import { InjectedConnector } from '@web3-react/injected-connector'
import { WalletLinkConnector } from '@web3-react/walletlink-connector'

export { NETWORK_CHAIN_ID, fortmatic, portis, network, walletconnect, getNetworkLibrary } from '@src/connectors'

const NETWORK_URL = process.env.REACT_APP_NETWORK_URL
if (typeof NETWORK_URL === 'undefined') {
  throw new Error(`REACT_APP_NETWORK_URL must be a defined environment variable`)
}

export const injected = new InjectedConnector({
  supportedChainIds: [ChainId.MAINNET, ChainId.ROPSTEN, ChainId.RINKEBY, ChainId.GÖRLI, ChainId.KOVAN, ChainId.XDAI]
})

// mainnet only
export const walletlink = new WalletLinkConnector({
  url: NETWORK_URL,
  appName: 'Cow Swap',
  appLogoUrl: 'https://raw.githubusercontent.com/gnosis/gp-swap-ui/develop/public/images/logo-square-512.png'
})
