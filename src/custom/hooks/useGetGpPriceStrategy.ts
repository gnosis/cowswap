import ms from 'ms.macro'
import { useState, useEffect } from 'react'

export const DEFAULT_GP_PRICE_STRATEGY = 'LEGACY'

export type GpPriceStrategy = 'COWSWAP' | 'LEGACY'
// TODO: use actual API call
export async function checkGpPriceStrategy(): Promise<GpPriceStrategy> {
  return new Promise((accept) => setTimeout(() => accept(DEFAULT_GP_PRICE_STRATEGY), 500))
}
// arbitrary, could be more/less
const GP_PRICE_STRATEGY_INTERVAL_TIME = ms`30 minutes`

export default function useGetGpPriceStrategy(
  defaultApiToUse: GpPriceStrategy = DEFAULT_GP_PRICE_STRATEGY
): GpPriceStrategy {
  const [gpPriceStrategy, setGpPriceStrategy] = useState<GpPriceStrategy>(defaultApiToUse)

  useEffect(() => {
    console.debug('[useGetQuoteCallback::GP API Status]::', gpPriceStrategy)

    const checkStatus = () => {
      checkGpPriceStrategy()
        .then(setGpPriceStrategy)
        .catch((err: Error) => {
          console.error('[useGetQuoteCallback::useEffect] Error getting GP quote status::', err)
          // Fallback to DEFAULT
          setGpPriceStrategy(DEFAULT_GP_PRICE_STRATEGY)
        })
    }

    // Create initial call on mount
    checkStatus()

    // set interval for GP_PRICE_STRATEGY_INTERVAL_TIME (2 hours)
    const intervalId = setInterval(() => {
      checkStatus()
    }, GP_PRICE_STRATEGY_INTERVAL_TIME)

    return () => clearInterval(intervalId)
  }, [gpPriceStrategy])

  return gpPriceStrategy
}
