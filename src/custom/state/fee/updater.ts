import { useEffect } from 'react'
import { ChainId } from '@uniswap/sdk'
import { useActiveWeb3React } from 'hooks'
import { useAddFee, useAllFees } from './hooks'
import { useSwapState } from 'state/swap/hooks'
import useIsWindowVisible from 'hooks/useIsWindowVisible'
import { FeesMap } from './reducer'
import { FeeInformation, getFeeQuote } from 'utils/operator'
import { registerOnWindow } from 'utils/misc'

function isDateLater(dateA: string, dateB: string): boolean {
  const [parsedDateA, parsedDateB] = [Date.parse(dateA), Date.parse(dateB)]

  return parsedDateA > parsedDateB
}

export default function FeesUpdater(): null {
  const { chainId } = useActiveWeb3React()
  const {
    INPUT: { currencyId }
  } = useSwapState()
  const stateFeesMap = useAllFees({ chainId })
  const addFee = useAddFee()

  // Dispatch addFee to test
  /* e.g
  addFee({
    token: 'ETH',
    fee: { minimalFee: '2' }
  })
   */
  registerOnWindow({
    addFee: ({
      token,
      customChainId = chainId || 1,
      fee
    }: {
      token: string
      customChainId: number
      fee: Partial<FeeInformation>
    }) =>
      addFee({
        token,
        fee: {
          // expires in 5 minutes
          expirationDate: new Date(Date.now() + 300000).toISOString(),
          feeRatio: 0,
          minimalFee: '0',
          ...fee
        },
        chainId: customChainId
      })
  })

  const windowVisible = useIsWindowVisible()

  const now = new Date().toISOString()

  useEffect(() => {
    if (!stateFeesMap || !chainId || !currencyId || !windowVisible) return

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
      const isFeeDateValid = currentFee && isDateLater(currentFee.expirationDate, now)

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

    runFeeHook({ feesMap: stateFeesMap, sellToken: currencyId, chainId })
  }, [windowVisible, currencyId, chainId, now, addFee, stateFeesMap])

  return null
}
