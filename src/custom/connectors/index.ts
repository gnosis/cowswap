import { Web3Provider } from '@ethersproject/providers'
import { InjectedConnector } from '@web3-react/injected-connector'
import { WalletConnectConnector } from '@web3-react/walletconnect-connector'
import { WalletLinkConnector } from '@web3-react/walletlink-connector'
import { PortisConnector } from '@web3-react/portis-connector'

import { FortmaticConnector } from 'connectors/Fortmatic'
import { NetworkConnector } from 'connectors/NetworkConnector'

const SUPPORTED_CHAIN_IDS = process.env.REACT_APP_SUPPORTED_CHAIN_IDS
export const NETWORK_CHAIN_ID = parseInt(process.env.REACT_APP_CHAIN_ID ?? '1')

const FORMATIC_KEY = process.env.REACT_APP_FORTMATIC_KEY
const PORTIS_ID = process.env.REACT_APP_PORTIS_ID

type RpcNetworks = { [chainId: number]: string }

function getRpcNetworks(): [RpcNetworks, number[]] {
  // Make sure the mandatory envs are present
  if (typeof SUPPORTED_CHAIN_IDS === 'undefined') {
    throw new Error(`REACT_APP_NETWORK_URL must be a defined environment variable`)
  }

  // Get list of supported chains
  const chainIds = SUPPORTED_CHAIN_IDS.split(',').map(chainId => Number(chainId.trim()))
  if (chainIds.length === 0) {
    throw new Error(`At least one network should be supported. REACT_APP_CHAIN_ID`)
  }

  // Make sure the default chain is in the list of supported chains
  if (!chainIds.includes(NETWORK_CHAIN_ID)) {
    throw new Error(
      `The default chain id (${NETWORK_CHAIN_ID}) must be part of the list of supported networks: ${chainIds.join(
        ', '
      )}`
    )
  }

  // Return rpc urls per network
  const rpcNetworks = chainIds.reduce<RpcNetworks>((acc, chainId) => {
    const url = process.env['REACT_APP_NETWORK_URL_' + chainId]

    if (typeof url === 'undefined') {
      throw new Error(
        `Network ${chainId} is supported, however 'REACT_APP_NETWORK_URL_${chainId} environment variable was not defined`
      )
    }

    acc[chainId] = url

    return acc
  }, {})

  // Get chainIds (excluding the NETWORK_CHAIN_ID)
  // Reason: By convention we will return NETWORK_CHAIN_ID as the first element in the supported networks
  const otherChainIds = Object.keys(rpcNetworks)
    .map(Number)
    .filter(networkId => networkId !== NETWORK_CHAIN_ID)
  const supportedChainIds = [NETWORK_CHAIN_ID, ...otherChainIds]

  return [rpcNetworks, supportedChainIds]
}

const [rpcNetworks, supportedChainIds] = getRpcNetworks()

export const network = new NetworkConnector({
  urls: rpcNetworks,
  defaultChainId: NETWORK_CHAIN_ID
})

let networkLibrary: Web3Provider | undefined
export function getNetworkLibrary(): Web3Provider {
  return (networkLibrary = networkLibrary ?? new Web3Provider(network.provider as any))
}

export const injected = new InjectedConnector({ supportedChainIds })

// mainnet only
export const walletconnect = new WalletConnectConnector({
  // TODO: Use any network when this PR is merged https://github.com/NoahZinsmeister/web3-react/pull/185
  // rpc: rpcNetworks,
  rpc: { 1: rpcNetworks[NETWORK_CHAIN_ID] },
  bridge: 'https://bridge.walletconnect.org',
  qrcode: true,
  pollingInterval: 15000
})

// mainnet only
export const fortmatic = new FortmaticConnector({
  apiKey: FORMATIC_KEY ?? '',
  chainId: NETWORK_CHAIN_ID
})

// mainnet only
export const portis = new PortisConnector({
  dAppId: PORTIS_ID ?? '',
  // TODO: Allow to configure multiple networks in portis
  // networks: supportedChainIds
  networks: [NETWORK_CHAIN_ID]
})

// mainnet only
export const walletlink = new WalletLinkConnector({
  url: rpcNetworks[NETWORK_CHAIN_ID],
  appName: 'Uniswap',
  appLogoUrl:
    'https://mpng.pngfly.com/20181202/bex/kisspng-emoji-domain-unicorn-pin-badges-sticker-unicorn-tumblr-emoji-unicorn-iphoneemoji-5c046729264a77.5671679315437924251569.jpg'
})
