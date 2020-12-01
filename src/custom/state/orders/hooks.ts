import { ChainId } from '@uniswap/sdk'
import { useDispatch, useSelector } from 'react-redux'

import { AppDispatch, AppState } from 'state'
import { addOrder, removeOrder, clearOrders, Order, UUID } from './actions'
import { OrdersState } from './reducer'

interface AddOrderParams extends GetRemoveOrderParams {
  order: Order
}
interface GetRemoveOrderParams {
  id: UUID
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
  return (addOrderParams: AddOrderParams) => dispatch(addOrder(addOrderParams))
}

export const useRemoveOrder = (): RemoveOrderCallback => {
  const dispatch = useDispatch<AppDispatch>()
  return (removeOrderParams: GetRemoveOrderParams) => dispatch(removeOrder(removeOrderParams))
}

export const useClearOrders = (): ClearOrdersCallback => {
  const dispatch = useDispatch<AppDispatch>()
  return (clearOrdersParams: ClearOrdersParams) => dispatch(clearOrders(clearOrdersParams))
}
