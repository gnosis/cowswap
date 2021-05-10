import { FeeInformation, PriceInformation, UnsupportedToken } from './reducer'

export function isFeeOrPriceInformation(
  object: FeeInformation | PriceInformation | UnsupportedToken | undefined
): object is FeeInformation | PriceInformation {
  return (object as FeeInformation).amount !== undefined || (object as PriceInformation).amount !== undefined
}

export function isUnsupportedToken(
  object: FeeInformation | PriceInformation | UnsupportedToken | undefined
): object is UnsupportedToken {
  return (object as UnsupportedToken).errorType !== undefined
}
