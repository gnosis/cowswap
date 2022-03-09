import BlocknativeSdk from 'bnc-sdk'
import { getSupportedChainIds } from 'connectors'
import { devInfo, devLog } from './logging'

const BLOCKNATIVE_API_KEY = process.env.REACT_APP_BLOCKNATIVE_API_KEY

interface SDKError {
  message: string
  error?: any
  account?: string
  transaction?: string
}

export const sdk = !BLOCKNATIVE_API_KEY
  ? {}
  : getSupportedChainIds().reduce<Record<number, BlocknativeSdk | null>>((acc, networkId) => {
      try {
        acc[networkId] = new BlocknativeSdk({
          dappId: BLOCKNATIVE_API_KEY,
          networkId,
          name: 'bnc_' + networkId,
          onerror: (error: SDKError) => {
            devLog(error)
          },
        })
      } catch (error) {
        console.error('Instantiating BlocknativeSdk failed', error)
      }

      devInfo(`BlocknativeSdk initialized on chain ${networkId}`)

      return acc
    }, {})
