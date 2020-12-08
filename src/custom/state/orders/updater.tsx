import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useActiveWeb3React } from 'hooks'
import { /* useAddPopup ,*/ useBlockNumber } from 'state/application/hooks'
import { AppDispatch, AppState } from 'state'
import { removeOrder, OrderFromApi } from './actions'
import { utils } from 'ethers'
import { Log } from '@ethersproject/abstract-provider'

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

          const orderData: OrderFromApi = await res.json()

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

// example of event watching + decoding without contract
const transferEventAbi = 'event Transfer(address indexed from, address indexed to, uint amount)'
const ERC20Interface = new utils.Interface([transferEventAbi])

const TransferEvent = ERC20Interface.getEvent('Transfer')

const TransferEventTopics = ERC20Interface.encodeFilterTopics(TransferEvent, [])

const decodeTransferEvent = (transferEventLog: Log) => {
  return ERC20Interface.decodeEventLog(TransferEvent, transferEventLog.data, transferEventLog.topics)
}

export function EventUpdater(): null {
  const { chainId, library } = useActiveWeb3React()

  useEffect(() => {
    if (!chainId || !library) return

    const listener = (log: Log) => {
      console.log('Transfer::log', log) // the log isn't decoded, if used through contract, can have decoded already

      // decode manually for now
      const { from, to, amount } = decodeTransferEvent(log)

      console.log('Detected transfer of token', log.address, { from, to, amount })
    }
    library.on(TransferEventTopics, listener)

    return () => {
      library.off(TransferEventTopics, listener)
    }
  }, [chainId, library])

  return null
}
