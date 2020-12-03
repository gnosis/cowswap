import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useActiveWeb3React } from 'hooks'
import { /* useAddPopup ,*/ useBlockNumber } from 'state/application/hooks'
import { AppDispatch, AppState } from 'state'
import { removeOrder } from './actions'
import { utils } from 'ethers'
import { getContract } from '@src/utils'

// first iteration -- checking on each block
// ideally we would check agains backend orders from last session, only once, on page load
// and afterwards continually watch contract events
export function PollOnBlockUpdater(): null {
  const { chainId, library } = useActiveWeb3React()

  const lastBlockNumber = useBlockNumber()

  const dispatch = useDispatch<AppDispatch>()
  const state = useSelector<AppState, AppState['orders']>(state => state.orders)

  // show popup on confirm
  // for displaying fulfilled orders
  // const addPopup = useAddPopup()

  useEffect(() => {
    async function checkOrderStatuses() {
      if (!chainId || !library || !lastBlockNumber) return

      const orders = state[chainId]
      if (!orders) return

      // check for each order by id if possible
      // if not, get all orders and filter, will need order.owner
      Object.values(orders).forEach(async order => {
        // order is never undefined here, but TS thinks so
        if (!order) return

        try {
          const { id } = order.order
          const res = await fetch(`link_to_service/api/v1/order/${id}`)

          if (!res.ok) throw new Error(res.statusText)

          // const orderData: OrderFull = await res.json()

          // if (order not fullfilled) return

          dispatch(removeOrder({ chainId, id }))
        } catch (error) {
          console.error('Error fetching orders', error)
        }
      })
    }

    checkOrderStatuses()
  }, [chainId, dispatch, lastBlockNumber, library, state])

  return null
}

export function EventUpdater(): null {
  const { chainId, library } = useActiveWeb3React()

  useEffect(() => {
    const abi = ['event Transfer(address indexed src, address indexed dst, uint val)']
    if (!chainId || !library) return

    const Contr = getContract('', abi, library)
    Contr.on('Transfer', (...args) => {
      console.log('Contract::onTransfer', ...args)
    })

    const Interface = new utils.Interface(abi)

    const topicSets = [utils.id('Transfer(address,address,uint256)')]

    const listener = (log: any, event: any) => {
      console.log('Transfer::event', event)
      console.log('Transfer::log', log) // the log isn't decoded, better use through contract
      // Emitted any token is sent TO either address

      console.log('Transfer::decode 1', Interface.decodeEventLog('Transfer', log.data, log.topics))
      console.log('Transfer::decode 2', Interface.decodeEventLog('Transfer', log.data))

      const decoded = utils.defaultAbiCoder.decode(['address', 'address', 'uint256'], log.data)
      console.log('Transfer::decoded_data', decoded)
    }
    library.on(topicSets, listener)

    return () => {
      library.off(topicSets, listener)
    }
  }, [chainId, library])

  return null
}

// export default function Updater(): null {
//   const { chainId, library } = useActiveWeb3React()

//   const lastBlockNumber = useBlockNumber()

//   const dispatch = useDispatch<AppDispatch>()
//   const state = useSelector<AppState, AppState['orders']>(state => state.orders)

//   const transactions = chainId ? state[chainId] ?? {} : {}

//   useEffect(() => {
//     if (!chainId || !library || !lastBlockNumber) return

//     Object.keys(transactions)
//       .filter(hash => shouldCheck(lastBlockNumber, transactions[hash]))
//       .forEach(hash => {
//         library
//           .getTransactionReceipt(hash)
//           .then(receipt => {
//             if (receipt) {
//               dispatch(
//                 finalizeTransaction({
//                   chainId,
//                   hash,
//                   receipt: {
//                     blockHash: receipt.blockHash,
//                     blockNumber: receipt.blockNumber,
//                     contractAddress: receipt.contractAddress,
//                     from: receipt.from,
//                     status: receipt.status,
//                     to: receipt.to,
//                     transactionHash: receipt.transactionHash,
//                     transactionIndex: receipt.transactionIndex
//                   }
//                 })
//               )

//               addPopup(
//                 {
//                   txn: {
//                     hash,
//                     success: receipt.status === 1,
//                     summary: transactions[hash]?.summary
//                   }
//                 },
//                 hash
//               )
//             } else {
//               dispatch(checkedTransaction({ chainId, hash, blockNumber: lastBlockNumber }))
//             }
//           })
//           .catch(error => {
//             console.error(`failed to check transaction hash: ${hash}`, error)
//           })
//       })
//   }, [chainId, library, transactions, lastBlockNumber, dispatch, addPopup])

//   return null
// }
