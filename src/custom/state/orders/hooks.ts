import { useDispatch, useSelector } from 'react-redux'

import { AppDispatch, AppState } from 'state'
import { addOrder, removeOrder, OrderCreation, UUID } from './actions'
import { OrdersState } from './reducer'

interface AddOrderParams extends RemoveOrderParams {
  order: OrderCreation
}
interface RemoveOrderParams {
  id: UUID
}

type AddOrderCallback = (addOrderParams: AddOrderParams) => void
type RemoveOrderCallback = (clearOrderParams: RemoveOrderParams) => void

export const useOrder = (orderId: UUID): OrderCreation | undefined => {
  const { orderMap } = useSelector<AppState, OrdersState>(state => state.orders)

  return orderMap[orderId]?.order
}

export const useAddOrder = (): AddOrderCallback => {
  const dispatch = useDispatch<AppDispatch>()
  return (addOrderParams: AddOrderParams) => dispatch(addOrder(addOrderParams))
}

export const useRemoveOrder = (): RemoveOrderCallback => {
  const dispatch = useDispatch<AppDispatch>()
  return (removeOrderParams: RemoveOrderParams) => dispatch(removeOrder(removeOrderParams))
}
