import { ChainId } from '@uniswap/sdk'
import { useCallback, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { AppDispatch, AppState } from 'state'
import { addOrder, removeOrder, clearOrders, Order, OrderID, OrderStatus } from './actions'
import { OrderObject, OrdersState } from './reducer'

interface AddOrderParams extends GetRemoveOrderParams {
  order: Order
}
interface GetRemoveOrderParams {
  id: OrderID
  chainId: ChainId
}

interface ClearOrdersParams {
  chainId: ChainId
}

type GetOrdersParams = Pick<GetRemoveOrderParams, 'chainId'>

type AddOrderCallback = (addOrderParams: AddOrderParams) => void
type RemoveOrderCallback = (clearOrderParams: GetRemoveOrderParams) => void
type ClearOrdersCallback = (clearOrdersParams: ClearOrdersParams) => void

export const useOrder = ({ id, chainId }: GetRemoveOrderParams): Order | undefined => {
  const state = useSelector<AppState, OrdersState>(state => state.orders)

  return state[chainId]?.[id]?.order
}

// TOD
const isTruthy = <T>(value: T | null | undefined | false): value is T => !!value

export const useOrders = ({ chainId }: GetOrdersParams): Order[] => {
  const state = useSelector<AppState, OrdersState[ChainId]>(state => state.orders?.[chainId])

  return useMemo(() => {
    if (!state) return []

    const allOrders = Object.values(state)
      .map(orderObject => orderObject?.order)
      .filter(isTruthy)
    return allOrders
  }, [state])
}

export const usePendingOrders = ({ chainId }: GetOrdersParams): Order[] => {
  const state = useSelector<AppState, OrdersState[ChainId]>(state => state.orders?.[chainId])

  return useMemo(() => {
    if (!state) return []

    const allOrders = Object.values(state)
      .map(orderObject => orderObject?.order)
      .filter((order): order is Order => !!order && order.status === OrderStatus.PENDING)
    return allOrders
  }, [state])
}

export const useFulfilledOrders = ({ chainId }: GetOrdersParams): Order[] => {
  const state = useSelector<AppState, OrdersState[ChainId]>(state => state.orders?.[chainId])

  return useMemo(() => {
    if (!state) return []

    const allOrders = Object.values(state)
      .map(orderObject => orderObject?.order)
      .filter((order): order is Order => !!order && order.status === OrderStatus.FULFILLED)
    return allOrders
  }, [state])
}

export const useAddOrder = (): AddOrderCallback => {
  const dispatch = useDispatch<AppDispatch>()
  return useCallback((addOrderParams: AddOrderParams) => dispatch(addOrder(addOrderParams)), [dispatch])
}

export const useRemoveOrder = (): RemoveOrderCallback => {
  const dispatch = useDispatch<AppDispatch>()
  return useCallback((removeOrderParams: GetRemoveOrderParams) => dispatch(removeOrder(removeOrderParams)), [dispatch])
}

export const useClearOrders = (): ClearOrdersCallback => {
  const dispatch = useDispatch<AppDispatch>()
  return useCallback((clearOrdersParams: ClearOrdersParams) => dispatch(clearOrders(clearOrdersParams)), [dispatch])
}
