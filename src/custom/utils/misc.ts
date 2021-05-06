import { ChainId } from '@uniswap/sdk'
// import { OrderKind } from 'state/orders/actions'

export const isTruthy = <T>(value: T | null | undefined | false): value is T => !!value

export const delay = <T = void>(ms = 100, result?: T): Promise<T> =>
  new Promise(resolve => setTimeout(resolve, ms, result))

export const registerOnWindow = (registerMapping: Record<string, any>) => {
  Object.entries(registerMapping).forEach(([key, value]) => {
    ;(window as any)[key] = value
  })
}

export function getChainIdValues(): ChainId[] {
  const ChainIdList = Object.values(ChainId)

  // cut in half as enums are always represented as key/value and then inverted
  // https://stackoverflow.com/a/51536142
  return ChainIdList.slice(ChainIdList.length / 2) as ChainId[]
}

// export function getCanonicalMarket(sellToken: string, buyToken: string, kind: OrderKind) {
//   // TODO: Implement smarter logic https://github.com/gnosis/gp-ui/issues/331

//   if (kind === 'sell') {
//   }

//   return {
//     quoteToken,
//     baseToken
//   }
// }
