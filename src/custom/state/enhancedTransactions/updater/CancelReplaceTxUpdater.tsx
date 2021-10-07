import { useEffect } from 'react'
import ReactGA from 'react-ga'
import { useAppDispatch } from 'state/hooks'
import { useActiveWeb3React } from 'hooks/web3'
import { sdk } from 'utils/blocknative'
import { replaceTransaction } from 'state/enhancedTransactions/actions'
import { useAllPendingHashes } from 'state/enhancedTransactions/hooks'
import { Dispatch } from 'redux'

function watchTxChanges(pendingHashes: string[], chainId: number, dispatch: Dispatch) {
  for (const hash of pendingHashes) {
    try {
      const { emitter } = sdk[chainId].transaction(hash)
      const currentHash = hash

      emitter.on('txSpeedUp', (e) => {
        if ('hash' in e && typeof e.hash === 'string') {
          ReactGA.event({
            category: 'Transaction',
            action: 'Speedup',
          })
          dispatch(replaceTransaction({ chainId, oldHash: currentHash, newHash: e.hash, type: 'speedup' }))
        }
      })

      emitter.on('txCancel', (e) => {
        if ('hash' in e && typeof e.hash === 'string') {
          ReactGA.event({
            category: 'Transaction',
            action: 'Cancelled',
          })
          dispatch(replaceTransaction({ chainId, oldHash: currentHash, newHash: e.hash, type: 'cancel' }))
        }
      })

      emitter.on('txFailed', (e) => {
        if ('hash' in e && typeof e.hash === 'string') {
          ReactGA.event({
            category: 'Transaction',
            action: 'Failed',
          })
        }
      })
    } catch (error) {
      console.error('Failed to watch', hash, error)
    }
  }
}

function unwatchTxChanges(pendingHashes: string[], chainId: number) {
  for (const hash of pendingHashes) {
    try {
      sdk[chainId].unsubscribe(hash)
    } catch (error) {
      console.error('Failed to unsubscribe', hash)
    }
  }
}

export default function CancelReplaceTxUpdater(): null {
  const { chainId, library } = useActiveWeb3React()
  const dispatch = useAppDispatch()
  const pendingHashes = useAllPendingHashes()

  useEffect(() => {
    if (!chainId || !library) return

    // Watch the mempool for cancelation/replacement of tx
    watchTxChanges(pendingHashes, chainId, dispatch)

    return () => {
      // Unwatch the mempool
      unwatchTxChanges(pendingHashes, chainId)
    }
  }, [chainId, library, pendingHashes, dispatch])

  return null
}
