import BlocknativeSdk from 'bnc-sdk'
import { SDKError /*, TransactionEvent*/ } from 'bnc-sdk/dist/types/src/interfaces'
import { getSupportedChainIds } from 'connectors'

export const sdk = getSupportedChainIds().reduce<Record<number, BlocknativeSdk>>((acc, networkId) => {
  acc[networkId] = new BlocknativeSdk({
    dappId: process.env.REACT_APP_BLOCKNATIVE_API_KEY || '',
    networkId,
    name: 'bnc_' + networkId,
    //transactionHandlers: [(event: TransactionEvent) => console.log(event.transaction)],
    onerror: (error: SDKError) => {
      console.log(error)
    },
  })

  return acc
}, {})
