import { ChainId } from '@uniswap/sdk'
import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { AppDispatch, AppState } from 'state'
import { addOrder, removeOrder, clearOrders, Order, OrderID } from './actions'
import { OrdersState } from './reducer'

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

type AddOrderCallback = (addOrderParams: AddOrderParams) => void
type RemoveOrderCallback = (clearOrderParams: GetRemoveOrderParams) => void
type ClearOrdersCallback = (clearOrdersParams: ClearOrdersParams) => void

export const useOrder = ({ id, chainId }: GetRemoveOrderParams): Order | undefined => {
  const state = useSelector<AppState, OrdersState>(state => state.orders)

  return state[chainId]?.[id]?.order
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
