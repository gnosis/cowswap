import { sdk } from '@src/custom/utils/blocknative'
import { useEffect, useMemo } from 'react'
import { useAppDispatch, useAppSelector } from 'state/hooks'
import { useActiveWeb3React } from 'hooks/web3'
import { cancelTransaction } from '@src/custom/state/enhancedTransactions/actions'

export default function Updater(): null {
  const { chainId, library } = useActiveWeb3React()
  const dispatch = useAppDispatch()
  const state = useAppSelector((state) => state.transactions)

  const transactions = useMemo(() => (chainId ? state[chainId] ?? {} : {}), [chainId, state])

  useEffect(() => {
    if (!chainId || !library) return

    const hashes = Object.keys(transactions).filter((hash) => !transactions[hash].receipt)

    for (const hash of hashes) {
      const { emitter } = sdk[chainId].transaction(hash)
      const currentHash = hash

      emitter.on('txConfirmed', (e) => {
        // canceled txs are automatically watched by bnc so if the confirmed tx hash is different than the previously tracked one, it means the user sent a cancel tx
        if ('hash' in e && e.hash !== currentHash) {
          dispatch(cancelTransaction({ chainId, hash }))
        }
      })
    }

    return () => {
      for (const hash of hashes) {
        sdk[chainId].unsubscribe(hash)
      }
    }
  }, [chainId, library, transactions, dispatch])

  return null
}
