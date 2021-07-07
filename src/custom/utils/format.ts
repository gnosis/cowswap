import BigNumber from 'bignumber.js'

export * from '@gnosis.pm/dex-js'

const TEN = new BigNumber(10)

export function formatAtoms(amount: string, decimals: number): string {
  return new BigNumber(amount).div(TEN.pow(decimals)).toString(10)
}
