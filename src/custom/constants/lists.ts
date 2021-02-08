// the Uniswap Default token list lives here

import { ChainId } from '@uniswap/sdk'

// TODO: Select default list dependent on network
export const DEFAULT_TOKEN_LIST_URL_MAINNET = 'tokens.uniswap.eth'
export const DEFAULT_TOKEN_LIST_URL_XDAI = 'https://tokens.honeyswap.org'
export const DEFAULT_TOKEN_LIST_URL_RINKEBY = 'tokens.uniswap.eth'

// Use chainId to get default starting list on empty state
export const getDefaultListByChainId = (chainId: ChainId = ChainId.MAINNET) => {
  switch (chainId) {
    case ChainId.XDAI:
      return DEFAULT_TOKEN_LIST_URL_XDAI
    case ChainId.MAINNET:
      return DEFAULT_TOKEN_LIST_URL_MAINNET
    // TODO: figure out rinkeby llist
    case ChainId.RINKEBY:
      return DEFAULT_TOKEN_LIST_URL_MAINNET
    // As default (e.g no chainId) return mainnet list
    default:
      return DEFAULT_TOKEN_LIST_URL_MAINNET
  }
}

// if we want different sub lists
export const DEFAULT_LIST_OF_LISTS = {
  [ChainId.MAINNET]: [
    getDefaultListByChainId(ChainId.MAINNET),
    't2crtokens.eth', // kleros
    'tokens.1inch.eth', // 1inch
    'synths.snx.eth',
    'tokenlist.dharma.eth',
    'defi.cmc.eth',
    'erc20.cmc.eth',
    'stablecoin.cmc.eth',
    'tokenlist.zerion.eth',
    'tokenlist.aave.eth',
    'https://tokens.coingecko.com/uniswap/all.json',
    'https://app.tryroll.com/tokens.json',
    'https://raw.githubusercontent.com/compound-finance/token-list/master/compound.tokenlist.json',
    'https://defiprime.com/defiprime.tokenlist.json',
    'https://umaproject.org/uma.tokenlist.json'
  ],
  // TODO: get rinkeby list
  [ChainId.ROPSTEN]: [
    getDefaultListByChainId(ChainId.RINKEBY),
    't2crtokens.eth', // kleros
    'tokens.1inch.eth', // 1inch
    'synths.snx.eth',
    'tokenlist.dharma.eth',
    'defi.cmc.eth',
    'erc20.cmc.eth',
    'stablecoin.cmc.eth',
    'tokenlist.zerion.eth',
    'tokenlist.aave.eth',
    'https://tokens.coingecko.com/uniswap/all.json',
    'https://app.tryroll.com/tokens.json',
    'https://raw.githubusercontent.com/compound-finance/token-list/master/compound.tokenlist.json',
    'https://defiprime.com/defiprime.tokenlist.json',
    'https://umaproject.org/uma.tokenlist.json'
  ],
  // TODO: get rinkeby list
  [ChainId.KOVAN]: [
    getDefaultListByChainId(ChainId.RINKEBY),
    't2crtokens.eth', // kleros
    'tokens.1inch.eth', // 1inch
    'synths.snx.eth',
    'tokenlist.dharma.eth',
    'defi.cmc.eth',
    'erc20.cmc.eth',
    'stablecoin.cmc.eth',
    'tokenlist.zerion.eth',
    'tokenlist.aave.eth',
    'https://tokens.coingecko.com/uniswap/all.json',
    'https://app.tryroll.com/tokens.json',
    'https://raw.githubusercontent.com/compound-finance/token-list/master/compound.tokenlist.json',
    'https://defiprime.com/defiprime.tokenlist.json',
    'https://umaproject.org/uma.tokenlist.json'
  ],
  // TODO: get rinkeby list
  [ChainId.RINKEBY]: [
    getDefaultListByChainId(ChainId.RINKEBY),
    't2crtokens.eth', // kleros
    'tokens.1inch.eth', // 1inch
    'synths.snx.eth',
    'tokenlist.dharma.eth',
    'defi.cmc.eth',
    'erc20.cmc.eth',
    'stablecoin.cmc.eth',
    'tokenlist.zerion.eth',
    'tokenlist.aave.eth',
    'https://tokens.coingecko.com/uniswap/all.json',
    'https://app.tryroll.com/tokens.json',
    'https://raw.githubusercontent.com/compound-finance/token-list/master/compound.tokenlist.json',
    'https://defiprime.com/defiprime.tokenlist.json',
    'https://umaproject.org/uma.tokenlist.json'
  ],
  // TODO: get rinkeby list
  [ChainId.GÖRLI]: [
    getDefaultListByChainId(ChainId.RINKEBY),
    't2crtokens.eth', // kleros
    'tokens.1inch.eth', // 1inch
    'synths.snx.eth',
    'tokenlist.dharma.eth',
    'defi.cmc.eth',
    'erc20.cmc.eth',
    'stablecoin.cmc.eth',
    'tokenlist.zerion.eth',
    'tokenlist.aave.eth',
    'https://tokens.coingecko.com/uniswap/all.json',
    'https://app.tryroll.com/tokens.json',
    'https://raw.githubusercontent.com/compound-finance/token-list/master/compound.tokenlist.json',
    'https://defiprime.com/defiprime.tokenlist.json',
    'https://umaproject.org/uma.tokenlist.json'
  ],
  [ChainId.XDAI]: [getDefaultListByChainId(ChainId.XDAI)]
}
