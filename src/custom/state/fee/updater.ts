import { useEffect } from 'react'
import { useActiveWeb3React } from 'hooks'
import useIsWindowVisible from 'hooks/useIsWindowVisible'
import { useSwapState } from '@src/state/swap/hooks'
import { ChainId } from '@uniswap/sdk'
import { useAddFee, useAllFees } from './hooks'
import { FeesMap } from './reducer'
import { getFeeQuote } from 'utils/operator'

function isDateLater(dateA: string, dateB: string): boolean {
  const [parsedDateA, parsedDateB] = [Date.parse(dateA), Date.parse(dateB)]

  return parsedDateA > parsedDateB
}

export default function FeesUpdater(): null {
  const { chainId } = useActiveWeb3React()
  const { INPUT } = useSwapState()
  const stateFeesMap = useAllFees({ chainId })
  const addFee = useAddFee()

  const windowVisible = useIsWindowVisible()

  useEffect(() => {
    const inputCurrencyId = INPUT?.currencyId

    if (!stateFeesMap || !chainId || !inputCurrencyId || !windowVisible) return

    async function runFeeHook({
      feesMap,
      chainId,
      sellToken
    }: {
      feesMap: Partial<FeesMap>
      chainId: ChainId
      sellToken: string
    }) {
      const currentFee = feesMap[sellToken]?.fee
      const isFeeDateValid = currentFee && isDateLater(currentFee.expirationDate, new Date().toISOString())

      if (!isFeeDateValid || !currentFee) {
        const fee = await getFeeQuote(chainId, sellToken).catch(err => {
          console.error(new Error(err))
          return null
        })

        fee &&
          addFee({
            token: sellToken,
            fee,
            chainId
          })
      }
    }

    runFeeHook({ feesMap: stateFeesMap, sellToken: inputCurrencyId, chainId })
  }, [windowVisible, INPUT?.currencyId, chainId, addFee, stateFeesMap])

  return null
}
