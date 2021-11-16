import ms from 'ms.macro'
import { useState, useEffect } from 'react'

export const DEFAULT_GP_PRICE_STRATEGY = 'LEGACY'

export type GpPriceStrategy = 'COWSWAP' | 'LEGACY'
// TODO: use actual API call
// https://github.com/gnosis/gp-v2-contracts/issues/904
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
    console.debug('[useGetGpPriceStrategy::GP Price Strategy]::', gpPriceStrategy)

    const checkStatus = () => {
      checkGpPriceStrategy()
        .then(setGpPriceStrategy)
        .catch((err: Error) => {
          console.error('[useGetGpPriceStrategy::useEffect] Error getting GP price strategy::', err)
          // Fallback to DEFAULT
          setGpPriceStrategy(DEFAULT_GP_PRICE_STRATEGY)
        })
    }

    // Create initial call on mount
    checkStatus()

    // set interval for GP_PRICE_STRATEGY_INTERVAL_TIME (30 min)
    const intervalId = setInterval(() => {
      checkStatus()
    }, GP_PRICE_STRATEGY_INTERVAL_TIME)

    return () => clearInterval(intervalId)
  }, [gpPriceStrategy])

  return gpPriceStrategy
}
