import { useCallback, useEffect, useRef } from 'react'
import { useActiveWeb3React } from 'hooks/web3'
import { Price } from '@uniswap/sdk-core'
import { OrderFulfillmentData, Order } from './actions'
import {
  usePendingOrders,
  useFulfillOrdersBatch,
  useExpireOrdersBatch,
  useCancelOrdersBatch,
  useCancelledOrders,
  useSetIsOrderUnfillable,
} from './hooks'
import { getOrder, OrderID, OrderMetaData } from 'utils/operator'
import { CANCELLED_ORDERS_PENDING_TIME, ONE_HUNDRED_PERCENT, SHORT_PRECISION } from 'constants/index'
import { stringToCurrency } from '../swap/extension'
import {
  OPERATOR_API_POLL_INTERVAL,
  OUT_OF_MARKET_PRICE_DELTA_PERCENTAGE,
  PENDING_ORDERS_PRICE_CHECK_POLL_INTERVAL,
} from './consts'
import { SupportedChainId as ChainId } from 'constants/chains'
import { ApiOrderStatus, classifyOrder } from './utils'
import { formatSmart } from 'utils/format'
import { getBestPrice, PriceInformation } from 'utils/price'

type OrderLogPopupMixData = OrderFulfillmentData | OrderID

function _computeFulfilledSummary({
  orderFromStore,
  orderFromApi,
}: {
  orderFromStore?: Order
  orderFromApi: OrderMetaData | null
}) {
  // Default to store's current order summary
  let summary: string | undefined = orderFromStore?.summary

  // if we can find the order from the API
  // and our specific order exists in our state, let's use that
  if (orderFromApi) {
    const { buyToken, sellToken, executedBuyAmount, executedSellAmount } = orderFromApi

    if (orderFromStore) {
      const { inputToken, outputToken } = orderFromStore
      // don't show amounts in atoms
      const inputAmount = stringToCurrency(executedSellAmount, inputToken)
      const outputAmount = stringToCurrency(executedBuyAmount, outputToken)

      summary = `Swap ${formatSmart(inputAmount, SHORT_PRECISION)} ${inputAmount.currency.symbol} for ${formatSmart(
        outputAmount,
        SHORT_PRECISION
      )} ${outputAmount.currency.symbol}`
    } else {
      // We only have the API order info, let's at least use that
      summary = `Swap ${sellToken} for ${buyToken}`
    }
  } else {
    console.log(`[state:orders:updater] computeFulfilledSummary::API data not yet in sync with blockchain`)
  }

  return summary
}

type PopupData = {
  status: ApiOrderStatus
  popupData?: OrderLogPopupMixData
}

async function fetchOrderPopupData(orderFromStore: Order, chainId: ChainId): Promise<PopupData> {
  const orderFromApi = await getOrder(chainId, orderFromStore.id)

  const status = classifyOrder(orderFromApi)

  let popupData = undefined

  switch (status) {
    case 'fulfilled':
      popupData = {
        id: orderFromStore.id,
        fulfillmentTime: new Date().toISOString(),
        transactionHash: '', // there's no need  for a txHash as we'll link the notification to the Explorer
        summary: _computeFulfilledSummary({ orderFromStore, orderFromApi }),
      }
      break
    case 'expired':
    case 'cancelled':
      popupData = orderFromStore.id
      break
    default:
      // No popup for other states
      break
  }

  return { status, popupData }
}

export function EventUpdater(): null {
  const { chainId } = useActiveWeb3React()

  const pending = usePendingOrders({ chainId })

  // Ref, so we don't rerun useEffect
  const pendingRef = useRef(pending)
  pendingRef.current = pending

  const fulfillOrdersBatch = useFulfillOrdersBatch()
  const expireOrdersBatch = useExpireOrdersBatch()
  const cancelOrdersBatch = useCancelOrdersBatch()

  const updateOrders = useCallback(
    async (chainId: ChainId) => {
      // Exit early when there are no pending orders
      if (pendingRef.current.length === 0) {
        return
      }

      // Iterate over pending orders fetching operator order data, async
      const unfilteredOrdersData = await Promise.all(
        pendingRef.current.map(async (orderFromStore) => fetchOrderPopupData(orderFromStore, chainId))
      )

      // Group resolved promises by status
      // Only pick the status that are final
      const { fulfilled, expired, cancelled } = unfilteredOrdersData.reduce<
        Record<ApiOrderStatus, OrderLogPopupMixData[]>
      >(
        (acc, { status, popupData }) => {
          popupData && acc[status].push(popupData)
          return acc
        },
        { fulfilled: [], expired: [], cancelled: [], unknown: [], pending: [] }
      )

      // Bach state update per group, if any

      fulfilled.length > 0 &&
        fulfillOrdersBatch({
          ordersData: fulfilled as OrderFulfillmentData[],
          chainId,
        })
      expired.length > 0 &&
        expireOrdersBatch({
          ids: expired as OrderID[],
          chainId,
        })
      cancelled.length > 0 &&
        cancelOrdersBatch({
          ids: cancelled as OrderID[],
          chainId,
        })
    },
    [cancelOrdersBatch, expireOrdersBatch, fulfillOrdersBatch]
  )

  useEffect(() => {
    if (!chainId) {
      return
    }

    const interval = setInterval(() => updateOrders(chainId), OPERATOR_API_POLL_INTERVAL)

    return () => clearInterval(interval)
  }, [chainId, updateOrders])

  return null
}

/**
 * Updater for cancelled orders.
 *
 * Similar to Event updater, but instead of watching pending orders, it watches orders that have been cancelled
 * in the last 5 min.
 *
 * Whenever an order that was cancelled but has since been fulfilled, trigger a state update
 * and a popup notification, changing the status from cancelled to fulfilled.
 *
 * It's supposed to fix race conditions between the api accepting a cancellation while a solution was already
 * submitted to the network by a solver.
 * Due to the network's nature, we can't tell whether an order has been really cancelled, so we prefer to wait a short
 * period and say it's cancelled even though in some cases it might actually be filled.
 */
export function CancelledOrdersUpdater(): null {
  const { chainId } = useActiveWeb3React()

  const cancelled = useCancelledOrders({ chainId })

  // Ref, so we don't rerun useEffect
  const cancelledRef = useRef(cancelled)
  cancelledRef.current = cancelled

  const fulfillOrdersBatch = useFulfillOrdersBatch()

  const updateOrders = useCallback(
    async (chainId: ChainId) => {
      // Filter orders created in the last 5 min, no further
      const pending = cancelledRef.current.filter(
        (order) => Date.now() - new Date(order.creationTime).getTime() < CANCELLED_ORDERS_PENDING_TIME
      )

      if (pending.length === 0) {
        return
      }

      // Iterate over pending orders fetching operator order data, async
      const unfilteredOrdersData = await Promise.all(
        pending.map(async (orderFromStore) => fetchOrderPopupData(orderFromStore, chainId))
      )

      // Group resolved promises by status
      // Only pick fulfilled
      const { fulfilled } = unfilteredOrdersData.reduce<Record<ApiOrderStatus, OrderLogPopupMixData[]>>(
        (acc, { status, popupData }) => {
          popupData && acc[status].push(popupData)
          return acc
        },
        { fulfilled: [], expired: [], cancelled: [], unknown: [], pending: [] }
      )

      // Bach state update fulfilled orders, if any
      fulfilled.length > 0 &&
        fulfillOrdersBatch({
          ordersData: fulfilled as OrderFulfillmentData[],
          chainId,
        })
    },
    [fulfillOrdersBatch]
  )

  useEffect(() => {
    if (!chainId) {
      return
    }

    const interval = setInterval(() => updateOrders(chainId), OPERATOR_API_POLL_INTERVAL)

    return () => clearInterval(interval)
  }, [chainId, updateOrders])

  return null
}

/**
 * Thin wrapper around `getBestPrice` that builds the params and returns null on failure
 *
 * @param chainId
 * @param order
 */
async function _getOrderPrice(chainId: ChainId, order: Order) {
  let amount, baseToken, quoteToken

  if (order.kind === 'sell') {
    amount = order.sellAmount.toString()
    baseToken = order.sellToken
    quoteToken = order.buyToken
  } else {
    amount = order.buyAmount.toString()
    baseToken = order.buyToken
    quoteToken = order.sellToken
  }

  const quoteParams = {
    chainId,
    amount,
    kind: order.kind,
    baseToken,
    quoteToken,
    fromDecimals: order.inputToken.decimals,
    toDecimals: order.outputToken.decimals,
  }

  try {
    return await getBestPrice(quoteParams)
  } catch (e) {
    return null
  }
}

/**
 * Based on the order and current price, returns `true` if order is out of the market.
 * Out of the market means the price difference between original and current to be positive
 * and greater than OUT_OF_MARKET_PRICE_DELTA_PERCENTAGE.
 * Negative difference is good for the user.
 * We allow for it to be up to OUT_OF_MARKET_PRICE_DELTA_PERCENTAGE worse to account for
 * small price changes
 *
 * @param order
 * @param price
 */
function isOrderUnfillable(order: Order, price: Required<PriceInformation>): boolean {
  // Build price object from stored order
  const orderPrice = new Price(
    order.inputToken,
    order.outputToken,
    order.sellAmount.toString(),
    order.buyAmount.toString()
  )

  // Build current price object from quoted price
  // Note that depending on the order type, the amount will be used either as nominator or denominator
  const currentPrice =
    order.kind === 'sell'
      ? new Price(order.inputToken, order.outputToken, order.sellAmount.toString(), price.amount as string)
      : new Price(order.inputToken, order.outputToken, price.amount as string, order.buyAmount.toString())

  // Calculate the percentage of the current price in regards to the order price
  const percentageDifference = ONE_HUNDRED_PERCENT.subtract(currentPrice.divide(orderPrice))

  console.debug(
    `[UnfillableOrdersUpdater::isOrderUnfillable] ${order.kind} [${order.id.slice(0, 8)}]:`,
    orderPrice.toSignificant(10),
    currentPrice.toSignificant(10),
    percentageDifference.toFixed(4),
    percentageDifference.greaterThan(OUT_OF_MARKET_PRICE_DELTA_PERCENTAGE)
  )

  // Example. Consider the pair X-Y:
  // Order price of 1X = 20459.60331Y
  // Current market price is 1X = 20562.41538Y
  // The different between order price and current price is -0.5025%
  // That means the market price is better than the order price, thus, NOT unfillable

  // Higher prices are worse, thus, the order will be unfillable whenever percentage difference is positive
  // Check whether given price difference is > Price delta %, to allow for small market variations
  return percentageDifference.greaterThan(OUT_OF_MARKET_PRICE_DELTA_PERCENTAGE)
}

/**
 * Updater that checks whether pending orders are still "fillable"
 */
export function UnfillableOrdersUpdater(): null {
  const { chainId } = useActiveWeb3React()
  const pending = usePendingOrders({ chainId })
  const setIsOrderUnfillable = useSetIsOrderUnfillable()

  // Ref, so we don't rerun useEffect
  const pendingRef = useRef(pending)
  pendingRef.current = pending

  const updateIsUnfillableFlag = useCallback(
    (chainId: ChainId, order: Order, price: Required<PriceInformation>) => {
      const isUnfillable = isOrderUnfillable(order, price)

      // Only trigger state update if flag changed
      order.isUnfillable !== isUnfillable && setIsOrderUnfillable({ chainId, id: order.id, isUnfillable })
    },
    [setIsOrderUnfillable]
  )

  const updatePending = useCallback(() => {
    if (!chainId || pendingRef.current.length === 0) {
      return
    }

    pendingRef.current.forEach((order, index) =>
      _getOrderPrice(chainId, order).then((price) => {
        console.debug(
          `[UnfillableOrdersUpdater::updateUnfillable] did we get any price? ${order.id.slice(0, 8)}|${index}`,
          price ? price.amount : 'no :('
        )
        price?.amount && updateIsUnfillableFlag(chainId, order, price)
      })
    )
  }, [chainId, updateIsUnfillableFlag])

  useEffect(() => {
    updatePending()

    const interval = setInterval(updatePending, PENDING_ORDERS_PRICE_CHECK_POLL_INTERVAL)

    return () => clearInterval(interval)
  }, [updatePending])

  return null
}
