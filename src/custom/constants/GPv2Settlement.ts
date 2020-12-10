import { ChainId } from '@uniswap/sdk'
import { Interface } from '@ethersproject/abi'
// Can even prune ABI down to onlywhat we use
// like events only
import GP_V2_SETTLEMENT from './GPv2Settlement.json'

export const GP_V2_SETTLEMENT_INTERFACE = new Interface(GP_V2_SETTLEMENT)

export const GP_SETTLEMENT_CONTRACT_ADDRESS: Partial<Record<ChainId, string>> = {
  [ChainId.MAINNET]: '0x6F400810b62df8E13fded51bE75fF5393eaa841F',
  [ChainId.RINKEBY]: '0xC576eA7bd102F7E476368a5E98FA455d1Ea34dE2'
  // TODO: extend chainId for adding xDAI
}
