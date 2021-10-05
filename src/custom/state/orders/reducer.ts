import { createReducer, PayloadAction } from '@reduxjs/toolkit'
import { OrderID } from 'api/gnosisProtocol'
import { SupportedChainId as ChainId } from 'constants/chains'
import {
  addOrUpdateOrders,
  addPendingOrder,
  cancelOrder,
  cancelOrdersBatch,
  clearOrders,
  expireOrder,
  expireOrdersBatch,
  fulfillOrder,
  fulfillOrdersBatch,
  OrderStatus,
  removeOrder,
  requestOrderCancellation,
  SerializedOrder,
  setIsOrderUnfillable,
  updateLastCheckedBlock,
} from './actions'
import { ContractDeploymentBlocks } from './consts'
import { Writable } from 'types'

// previous order state, to use in checks
// in case users have older, stale state and we need to handle
export interface V2OrderObject {
  id: OrderObject['id']
  order: Omit<OrderObject['order'], 'inputToken' | 'outputToken'>
}

export interface OrderObject {
  id: OrderID
  order: SerializedOrder
}

// {order uuid => OrderObject} mapping
type OrdersMap = Record<OrderID, OrderObject>
export type PartialOrdersMap = Partial<OrdersMap>

export type OrdersState = {
  readonly [chainId in ChainId]?: {
    pending: PartialOrdersMap
    fulfilled: PartialOrdersMap
    expired: PartialOrdersMap
    cancelled: PartialOrdersMap
    lastCheckedBlock: number
  }
}

export interface PrefillStateRequired {
  chainId: ChainId
}

// makes sure there's always an object at state[chainId], state[chainId].pending | .fulfilled
function prefillState(
  state: Writable<OrdersState>,
  { payload: { chainId } }: PayloadAction<PrefillStateRequired>
): asserts state is Required<OrdersState> {
  // asserts that state[chainId].pending | .fulfilled | .expired is ok to access
  const stateAtChainId = state[chainId]

  if (!stateAtChainId) {
    state[chainId] = {
      pending: {},
      fulfilled: {},
      expired: {},
      cancelled: {},
      lastCheckedBlock: ContractDeploymentBlocks[chainId] ?? 0,
    }
    return
  }

  if (!stateAtChainId.pending) {
    stateAtChainId.pending = {}
  }

  if (!stateAtChainId.fulfilled) {
    stateAtChainId.fulfilled = {}
  }

  if (!stateAtChainId.expired) {
    stateAtChainId.expired = {}
  }

  if (!stateAtChainId.cancelled) {
    stateAtChainId.cancelled = {}
  }

  if (stateAtChainId.lastCheckedBlock === undefined) {
    stateAtChainId.lastCheckedBlock = ContractDeploymentBlocks[chainId] ?? 0
  }
}

function popOrder(state: OrdersState, chainId: ChainId, status: OrderStatus, id: string): OrderObject | undefined {
  const orderObj = state?.[chainId]?.[status]?.[id]
  if (orderObj) {
    delete state?.[chainId]?.[status]?.[id]
  }
  return orderObj
}

const initialState: OrdersState = {}

export default createReducer(initialState, (builder) =>
  builder
    .addCase(addPendingOrder, (state, action) => {
      prefillState(state, action)
      const { order, id, chainId } = action.payload

      state[chainId].pending[id] = { order, id }
    })
    .addCase(removeOrder, (state, action) => {
      prefillState(state, action)
      const { id, chainId } = action.payload
      delete state[chainId].pending[id]
      delete state[chainId].fulfilled[id]
      delete state[chainId].expired[id]
      delete state[chainId].cancelled[id]
    })
    .addCase(addOrUpdateOrders, (state, action) => {
      prefillState(state, action)
      const { chainId, orders } = action.payload

      orders.forEach((newOrder) => {
        const { id, status } = newOrder

        // sanity check, is the status set?
        if (!status) {
          console.error(`addOrUpdateOrders:: Status not set for order ${id}`)
          return
        }

        // fetch order from state, if any
        const orderObj =
          popOrder(state, chainId, OrderStatus.FULFILLED, id) ||
          popOrder(state, chainId, OrderStatus.EXPIRED, id) ||
          popOrder(state, chainId, OrderStatus.CANCELLED, id) ||
          popOrder(state, chainId, OrderStatus.PENDING, id)

        // merge existing and new order objects
        const order = orderObj
          ? {
              ...orderObj.order,
              apiAdditionalInfo: newOrder.apiAdditionalInfo,
              isCancelling: newOrder.isCancelling,
              status,
            }
          : newOrder

        // add order to respective state
        state[chainId][status][id] = { order, id }
      })
    })
    .addCase(fulfillOrder, (state, action) => {
      prefillState(state, action)
      const { id, chainId, fulfillmentTime, transactionHash } = action.payload

      const orderObject = state[chainId].pending[id]

      if (orderObject) {
        delete state[chainId].pending[id]

        orderObject.order.status = OrderStatus.FULFILLED
        orderObject.order.fulfillmentTime = fulfillmentTime

        orderObject.order.fulfilledTransactionHash = transactionHash
        orderObject.order.isCancelling = false

        state[chainId].fulfilled[id] = orderObject
      }
    })
    .addCase(fulfillOrdersBatch, (state, action) => {
      prefillState(state, action)
      const { ordersData, chainId } = action.payload

      const pendingOrders = state[chainId].pending
      const cancelledOrders = state[chainId].cancelled
      const fulfilledOrders = state[chainId].fulfilled

      // if there are any newly fulfilled orders
      // update them
      ordersData.forEach(({ id, fulfillmentTime, transactionHash, apiAdditionalInfo }) => {
        const orderObject = pendingOrders[id] || cancelledOrders[id]

        if (orderObject) {
          delete pendingOrders[id]
          delete cancelledOrders[id]

          orderObject.order.status = OrderStatus.FULFILLED
          orderObject.order.fulfillmentTime = fulfillmentTime

          orderObject.order.fulfilledTransactionHash = transactionHash
          orderObject.order.isCancelling = false

          orderObject.order.apiAdditionalInfo = apiAdditionalInfo

          fulfilledOrders[id] = orderObject
        }
      })
    })
    .addCase(expireOrder, (state, action) => {
      prefillState(state, action)
      const { id, chainId } = action.payload

      const orderObject = state[chainId].pending[id]

      if (orderObject) {
        delete state[chainId].pending[id]

        orderObject.order.status = OrderStatus.EXPIRED
        orderObject.order.isCancelling = false

        state[chainId].expired[id] = orderObject
      }
    })
    .addCase(expireOrdersBatch, (state, action) => {
      prefillState(state, action)
      const { ids, chainId } = action.payload

      const pendingOrders = state[chainId].pending
      const fulfilledOrders = state[chainId].expired

      // if there are any newly fulfilled orders
      // update them
      ids.forEach((id) => {
        const orderObject = pendingOrders[id]

        if (orderObject) {
          delete pendingOrders[id]

          orderObject.order.status = OrderStatus.EXPIRED
          orderObject.order.isCancelling = false
          fulfilledOrders[id] = orderObject
        }
      })
    })
    .addCase(requestOrderCancellation, (state, action) => {
      prefillState(state, action)
      const { id, chainId } = action.payload

      const orderObject = state[chainId].pending[id]

      if (orderObject) {
        orderObject.order.isCancelling = true
      }
    })
    .addCase(cancelOrder, (state, action) => {
      prefillState(state, action)
      const { id, chainId } = action.payload

      const orderObject = state[chainId].pending[id]

      if (orderObject) {
        delete state[chainId].pending[id]

        orderObject.order.status = OrderStatus.CANCELLED
        orderObject.order.isCancelling = false

        state[chainId].cancelled[id] = orderObject
      }
    })
    .addCase(cancelOrdersBatch, (state, action) => {
      prefillState(state, action)
      const { ids, chainId } = action.payload

      const pendingOrders = state[chainId].pending
      const cancelledOrders = state[chainId].cancelled

      ids.forEach((id) => {
        const orderObject = pendingOrders[id]

        if (orderObject) {
          delete pendingOrders[id]

          orderObject.order.status = OrderStatus.CANCELLED
          orderObject.order.isCancelling = false
          cancelledOrders[id] = orderObject
        }
      })
    })
    .addCase(clearOrders, (state, action) => {
      const { chainId } = action.payload

      const lastCheckedBlock = state[chainId]?.lastCheckedBlock

      state[chainId] = {
        pending: {},
        fulfilled: {},
        expired: {},
        cancelled: {},
        lastCheckedBlock: lastCheckedBlock ?? ContractDeploymentBlocks[chainId] ?? 0,
      }
    })
    .addCase(updateLastCheckedBlock, (state, action) => {
      prefillState(state, action)
      const { chainId, lastCheckedBlock } = action.payload

      state[chainId].lastCheckedBlock = lastCheckedBlock
    })
    .addCase(setIsOrderUnfillable, (state, action) => {
      prefillState(state, action)
      const { chainId, id, isUnfillable } = action.payload

      const orderObject = state[chainId].pending[id]

      if (orderObject?.order) {
        orderObject.order.isUnfillable = isUnfillable
      }
    })
)
