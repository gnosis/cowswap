import { useEffect, useMemo } from 'react'
import { useDispatch } from 'react-redux'
import { useActiveWeb3React } from 'hooks'
import { useAddPopup, useBlockNumber } from 'state/application/hooks'
import { AppDispatch } from 'state'
// import { removeOrder, /* fulfillOrder, */ OrderFromApi } from './actions'
import { utils } from 'ethers'
import { Web3Provider } from '@ethersproject/providers'
import { Log, Filter } from '@ethersproject/abstract-provider'
import { useLastCheckedBlock } from './hooks'
import { updateLastCheckedBlock } from './actions'
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

      // still too many logs in 1 block
      // skip it
      // but this shouldn't happen
      if (toBlock === fromBlock) {
        console.error(`Too many logs in block ${toBlock}. Skipping. Some Orders may fail to update`)
        return []
      }

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

export function EventUpdater(): null {
  const { chainId, library } = useActiveWeb3React()
  // console.log('EventUpdater::library', library)
  // console.log('EventUpdater::chainId', chainId)

  const lastBlockNumber = useBlockNumber()
  const lastCheckedBlock = useLastCheckedBlock({ chainId })
  console.log('EventUpdater::lastCheckedBlock', lastCheckedBlock)
  console.log('EventUpdater::lastBlockNumber', lastBlockNumber)

  const dispatch = useDispatch<AppDispatch>()

  // show popup on confirm
  // for displaying fulfilled orders
  const addPopup = useAddPopup()

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

    // don't check for fromBlock > toBlock
    if (lastCheckedBlock + 1 > lastBlockNumber) return

    const getPastEvents = async () => {
      console.log('EventUpdater::getLogs', {
        fromBlock: lastCheckedBlock + 1,
        toBlock: lastBlockNumber,
        // address: '0x',
        topics: TransferEventTopics
      })

      const logs = await getLogsRetry({
        fromBlock: lastCheckedBlock + 1,
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

      // TODO: extend addPopup to accept whatever we want to show for Orders
      if (logs.length > 0) {
        const firstBlock = logs[0].blockNumber
        const lastBlock = logs[logs.length - 1].blockNumber

        const blocksRangeStr = firstBlock === lastBlock ? `block ${firstBlock}` : `blocks ${firstBlock} - ${lastBlock}`
        // Sample popup for events
        addPopup(
          {
            txn: {
              hash: logs[0].transactionHash,
              success: true,
              summary: `EventUpdater::Detected ${logs.length} token Transfers in ${blocksRangeStr}`
            }
          },
          logs[0].transactionHash
        )
      }

      // SET lastCheckedBlock = lastBlockNumber
      dispatch(updateLastCheckedBlock({ chainId, lastCheckedBlock: lastBlockNumber }))
    }

    getPastEvents()
  }, [chainId, library, lastBlockNumber, lastCheckedBlock, getLogsRetry, dispatch, addPopup])

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
