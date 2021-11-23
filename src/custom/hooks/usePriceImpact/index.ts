import useFiatValuePriceImpact from './useFiatValuePriceImpact'
import useFallbackPriceImpact from './useFallbackPriceImpact'
import { FallbackPriceImpactParams, ParsedAmounts } from './commonTypes'

type PriceImpactParams = Omit<FallbackPriceImpactParams, 'fiatPriceImpact'> & { parsedAmounts: ParsedAmounts }

export default function usePriceImpact({ abTrade, parsedAmounts }: PriceImpactParams) {
  /* const fiatPriceImpact =  */ useFiatValuePriceImpact(parsedAmounts)
  // TODO: remove this - testing only - forces fallback price impact
  const abaPriceImpact = useFallbackPriceImpact({ abTrade, fiatPriceImpact: undefined })

  // TODO: remove this - testing only - forces ABA
  return /* fiatPriceImpact ||  */ abaPriceImpact
}
