import { ChainId } from '@uniswap/sdk'
import { GPv2Settlement, GPv2AllowanceManager } from '@gnosis.pm/gp-v2-contracts/networks.json'

// reexport all Uniswap constants everything
export * from '@src/constants/index'

// TODO: When contracts are deployed, we can load this from the NPM package
export const GP_SETTLEMENT_CONTRACT_ADDRESS: Partial<Record<ChainId, string>> = {
  // [ChainId.MAINNET]: GPv2Settlement[1].address, // Not yet deployed
  [ChainId.RINKEBY]: GPv2Settlement[4].address
  // [ChainId.xDAI]: GPv2Settlement[100].address // Not yet deployed
}

export const GP_ALLOWANCE_MANAGER_CONTRACT_ADDRESS: Partial<Record<ChainId, string>> = {
  // [ChainId.MAINNET]: GPv2AllowanceManager[1].address, // Not yet deployed
  [ChainId.RINKEBY]: GPv2AllowanceManager[4].address
  // [ChainId.xDAI]: GPv2AllowanceManager[100].address // Not yet deployed
}
