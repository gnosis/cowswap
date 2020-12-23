// this file essentially provides all the overrides employed in uniswap-xdai-sdk fork
// + logic for chainId switch to/from xDAI
import {
  WETH as WETH_UNISWAP,
  Token,
  Pair,
  FACTORY_ADDRESS as FACTORY_ADDRESS_UNISWAP,
  INIT_CODE_HASH as INIT_CODE_HASH_UNISWAP,
  ETHER
} from '@uniswap/sdk'
import { pack, keccak256 } from '@ethersproject/solidity'
import { getCreate2Address } from '@ethersproject/address'

// extended ChainId
export enum ChainId {
  MAINNET = 1,
  ROPSTEN = 3,
  RINKEBY = 4,
  GÖRLI = 5,
  KOVAN = 42,
  XDAI = 100
}

// xDAI
export const FACTORY_ADDRESS_XDAI = '0xA818b4F111Ccac7AA31D0BCc0806d64F2E0737D7'
// xDAI
export const INIT_CODE_HASH_XDAI = '0x3f88503e8580ab941773b59034fb4b2a63e86dbc031b3633a925533ad3ed2b93'

export let FACTORY_ADDRESS = FACTORY_ADDRESS_UNISWAP
export let INIT_CODE_HASH = INIT_CODE_HASH_UNISWAP

let currentChainId: ChainId | undefined

// this is rather hacky but Pair.getAddress is used in new Pair(constructor)
// so it happens rather often with no obvious place to pass in dynamic chainId
export const switchXDAIparams = (chainId?: ChainId) => {
  if (currentChainId === chainId) return

  console.log('Changing library internal parameters for chainId', chainId)

  currentChainId = chainId

  if (chainId === ChainId.XDAI) {
    FACTORY_ADDRESS = FACTORY_ADDRESS_XDAI
    INIT_CODE_HASH = INIT_CODE_HASH_XDAI

    // ETHER is used in a bunch of places
    // Including internaly by the lib
    // easier to change name+symbol
    // this way you seeXDAI in Token selector when on xDAI
    // @ts-expect-error
    ETHER.name = 'xDai'
    // @ts-expect-error
    ETHER.symbol = 'XDAI'

    return
  }

  FACTORY_ADDRESS = FACTORY_ADDRESS_UNISWAP
  INIT_CODE_HASH = INIT_CODE_HASH_UNISWAP

  // @ts-expect-error
  ETHER.name = 'Ether'
  // @ts-expect-error
  ETHER.symbol = 'ETH'
}

// copy-pasta from the lib
let PAIR_ADDRESS_CACHE: { [token0Address: string]: { [token1Address: string]: string } } = {}

let PAIR_ADDRESS_CACHE_XDAI: { [token0Address: string]: { [token1Address: string]: string } } = {}

// overrides actual function to use xDAI specific FACTORY_ADDRESS and INIT_CODE_HASH
// copy-pasta from the lib
Pair.getAddress = function getAddress(tokenA: Token, tokenB: Token): string {
  const tokens = tokenA.sortsBefore(tokenB) ? [tokenA, tokenB] : [tokenB, tokenA] // does safety checks

  // separate caches for xDAI and non-xDAI
  let pairAddressCache = currentChainId === ChainId.XDAI ? PAIR_ADDRESS_CACHE_XDAI : PAIR_ADDRESS_CACHE

  if (pairAddressCache?.[tokens[0].address]?.[tokens[1].address] === undefined) {
    pairAddressCache = {
      ...pairAddressCache,
      [tokens[0].address]: {
        ...pairAddressCache?.[tokens[0].address],
        [tokens[1].address]: getCreate2Address(
          FACTORY_ADDRESS,
          keccak256(['bytes'], [pack(['address', 'address'], [tokens[0].address, tokens[1].address])]),
          INIT_CODE_HASH
        )
      }
    }

    // update respective caches
    if (currentChainId === ChainId.XDAI) PAIR_ADDRESS_CACHE_XDAI = pairAddressCache
    else PAIR_ADDRESS_CACHE = pairAddressCache
  }

  return pairAddressCache[tokens[0].address][tokens[1].address]
}

// used as UNI token
export const HONEY_XDAI = new Token(ChainId.XDAI, '0x71850b7e9ee3f13ab46d67167341e4bdc905eef9', 18, 'HNY', 'Honey')

export const USDC_XDAI = new Token(100, '0xDDAfbb505ad214D7b80b1f830fcCc89B60fb7A83', 6, 'USDC', 'USDC on xDai')

export const WETH_XDAI = new Token(
  ChainId.XDAI,
  '0x6A023CCd1ff6F2045C3309768eAd9E68F978f6e1',
  18,
  'WETH',
  'Wrapped Ether on xDai'
)
export const STAKE = new Token(
  ChainId.XDAI,
  '0xb7D311E2Eb55F2f68a9440da38e7989210b9A05e',
  18,
  'STAKE',
  'Stake Token on xDai'
)

export const WXDAI = new Token(ChainId.XDAI, '0xe91D153E0b41518A2Ce8Dd3D7944Fa863463a97d', 18, 'WXDAI', 'Wrapped XDAI')

// extends WETH to be used in Token Pairs logic
export const WETH = {
  ...WETH_UNISWAP,
  [ChainId.XDAI]: WXDAI
}
