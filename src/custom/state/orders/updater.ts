import { useEffect, useMemo } from 'react'
// import { /*useDispatch,*/ useSelector } from 'react-redux'
import { useActiveWeb3React } from 'hooks'
import { /* useAddPopup ,*/ useBlockNumber } from 'state/application/hooks'
// import { /*AppDispatch,*/ AppState } from 'state'
// import { removeOrder, /* fulfillOrder, */ OrderFromApi } from './actions'
import { utils } from 'ethers'
import { Web3Provider } from '@ethersproject/providers'
import { Log, Filter } from '@ethersproject/abstract-provider'
// import { PartialOrdersMap } from './reducer'

// example of event watching + decoding without contract
const transferEventAbi = 'event Transfer(address indexed from, address indexed to, uint amount)'
const ERC20Interface = new utils.Interface([transferEventAbi])

const TransferEvent = ERC20Interface.getEvent('Transfer')

const TransferEventTopics = ERC20Interface.encodeFilterTopics(TransferEvent, [])

// const decodeTransferEvent = (transferEventLog: Log) => {
//   return ERC20Interface.decodeEventLog(TransferEvent, transferEventLog.data, transferEventLog.topics)
// }

type RetryFilter = Filter & { fromBlock: number; toBlock: number }

const constructGetLogsRetry = (provider: Web3Provider) => {
  // tries fetching logs
  // if breaks, retries on half the range
  const getLogsRetry = async ({ fromBlock, toBlock, ...rest }: RetryFilter): Promise<Log[]> => {
    try {
      console.log(`EventUpdater::Getting logs fromBlock: ${fromBlock} toBlock ${toBlock}`)
      const logs = await provider.getLogs({
        fromBlock,
        toBlock,
        ...rest
      })
      // console.log('logs', logs)
      return logs
    } catch (error) {
      console.error(`Error getting logs fromBlock: ${fromBlock} toBlock ${toBlock}`, error)

      // expect -- RPC Error: query returned more than 10000 results --
      // if a different error - rethrow
      if (!error?.message?.includes('query returned more than')) throw error

      const midBlock = Math.floor((toBlock + fromBlock) / 2)

      const [beforeMidLogs, afterMidLogs] = await Promise.all([
        getLogsRetry({
          fromBlock,
          toBlock: midBlock
        }),
        getLogsRetry({
          fromBlock: midBlock + 1,
          toBlock
        })
      ])

      return beforeMidLogs.concat(afterMidLogs)
    }
  }

  return getLogsRetry
}

// temp block to start at
// TODO: put in state/orders
let lastCheckedBlock = 0

export function EventUpdater(): null {
  const { chainId, library } = useActiveWeb3React()
  // console.log('EventUpdater::library', library)
  // console.log('EventUpdater::chainId', chainId)

  const lastBlockNumber = useBlockNumber()
  console.log('EventUpdater::lastCheckedBlock', lastCheckedBlock)
  console.log('EventUpdater::lastBlockNumber', lastBlockNumber)

  // const dispatch = useDispatch<AppDispatch>()

  // const pendingOrders = useSelector<AppState, PartialOrdersMap | undefined>(
  //   state => chainId && state.orders?.[chainId]?.pending
  // )

  // const lastCheckedBlock = useSelector<AppState, number>(state => chainId && state.orders?.[chainId]?.lastCheckedBlock)

  // show popup on confirm
  // for displaying fulfilled orders
  // const addPopup = useAddPopup()

  const getLogsRetry = useMemo(() => {
    if (!library) return null
    return constructGetLogsRetry(library)
  }, [library])

  useEffect(() => {
    if (!chainId || !library || !getLogsRetry || !lastBlockNumber) return
    ;(window as any).getLogsRetry = (fromBlock: number, toBlock: number) => {
      // to play around with in console
      return getLogsRetry({
        fromBlock,
        toBlock,
        topics: TransferEventTopics
      })
    }

    // TEMP to start checking onlylast 10 blocks
    // otherwise Transfer events overwhelm the console
    if (lastCheckedBlock === 0) lastCheckedBlock = lastBlockNumber - 10

    // don't check for fromBlock > toBlock
    if (lastCheckedBlock + 1 > lastBlockNumber) return

    const getPastEvents = async () => {
      console.log('EventUpdater::getLogs', {
        fromBlock: lastCheckedBlock + 1,
        toBlock: lastBlockNumber,
        // address: '0x',
        topics: TransferEventTopics
      })

      // TEMP
      // will be replaced with
      // dispatch(updateOrdersLastCheckedBlock(lastBlockNumber))
      const wasLastCheckedBlock = lastCheckedBlock
      lastCheckedBlock = lastBlockNumber

      const logs = await getLogsRetry({
        fromBlock: wasLastCheckedBlock + 1,
        toBlock: lastBlockNumber,
        // address: '0x',
        topics: TransferEventTopics
      })

      // console.log('logs', logs)
      logs.forEach(log => {
        try {
          // const { from, to, amount } = decodeTransferEvent(log)
          // const { from, to, amount, id } = decodeTransferEvent(log)

          console.log('EventUpdater::Detected transfer of token in block', log.blockNumber)
          // console.log('EventUpdater::Detected transfer of token since last time', log.address, { from, to, amount })
          // dispatch(fulfillOrder({ chainId, id, fulfillmentTime: from log,if: from log }))
        } catch (e) {}
      })
    }

    getPastEvents()
  }, [chainId, library, lastBlockNumber, /* lastCheckedBlock,*/ getLogsRetry])

  // TODO: maybe implement event watching instead of getPastEvents on every block
  // useEffect(() => {
  //   if (!chainId || !library || !lastBlockNumber) return

  //   const listener = (log: Log) => {
  //     console.log('Transfer::log', log) // the log isn't decoded, if used through contract, can have decoded already

  //     // decode manually for now
  //     const { from, to, amount } = decodeTransferEvent(log)

  //     console.log('Detected transfer of token', log.address, { from, to, amount })
  //   }
  //   library.on(TransferEventTopics, listener)

  //   return () => {
  //     library.off(TransferEventTopics, listener)
  //   }
  // }, [chainId, library])

  return null
}
