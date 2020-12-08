import { SwapCallbackState } from '@src/hooks/useSwapCallback'
import { INITIAL_ALLOWED_SLIPPAGE } from 'constants/index'

// import { useSwapCallback as useSwapCallbackUniswap } from '@src/hooks/useSwapCallback'
import { ChainId, Percent, Trade } from '@uniswap/sdk'
import { useActiveWeb3React } from '@src/hooks'
import useENS from '@src/hooks/useENS'
import { useMemo } from 'react'
import useTransactionDeadline from '@src/hooks/useTransactionDeadline'
import { BigNumber } from 'ethers'
import { useAddPendingOrder } from '../state/operator/hooks'
import { PendingOrder } from '../state/operator/actions'
import { isAddress, shortenAddress } from '@src/utils'

interface PostOrderParams {
  account: string
  chainId: ChainId
  trade: Trade
  deadline?: BigNumber
  recipient: string
  recipientAddressOrName: string | null
  addPendingOrder: (order: PendingOrder) => void
}

function getSummary(params: PostOrderParams): string {
  const { trade, account, recipient, recipientAddressOrName } = params

  const inputSymbol = trade.inputAmount.currency.symbol
  const outputSymbol = trade.outputAmount.currency.symbol
  const inputAmount = trade.inputAmount.toSignificant(3)
  const outputAmount = trade.outputAmount.toSignificant(3)

  const base = `Swap ${inputAmount} ${inputSymbol} for ${outputAmount} ${outputSymbol}`
  const withRecipient =
    recipient === account
      ? base
      : `${base} to ${
          recipientAddressOrName && isAddress(recipientAddressOrName)
            ? shortenAddress(recipientAddressOrName)
            : recipientAddressOrName
        }`

  return withRecipient
}

async function postOrder(params: PostOrderParams): Promise<string> {
  const { trade, addPendingOrder } = params
  const { inputAmount } = trade

  const mockCallToApi = new Promise<string>(async (resolve, reject) => {
    setTimeout(() => {
      if (inputAmount.toExact() === '0.1') {
        // Force error for testing
        console.log('[useSwapCallback] Ups, we had a small issue!')
        reject(new Error('Mock error: The flux capacitor melted'))
      } else {
        // Pretend all went OK
        console.log('[useSwapCallback] Traded successfully!')
        resolve('123456789')
      }
    }, 3000)
  })

  const summary = getSummary(params)

  const uuid = await mockCallToApi
  addPendingOrder({
    order: {
      sellAmount: inputAmount.raw.toString(10)
    },
    summary
  })

  return uuid
}

// returns a function that will execute a swap, if the parameters are all valid
// and the user has approved the slippage adjusted input amount for the trade
export function useSwapCallback(
  trade: Trade | undefined, // trade to execute, required
  allowedSlippage: number = INITIAL_ALLOWED_SLIPPAGE, // in bips
  recipientAddressOrName: string | null // the ENS name or address of the recipient of the trade, or null if swap should be returned to sender
): { state: SwapCallbackState; callback: null | (() => Promise<string>); error: string | null } {
  const { account, chainId, library } = useActiveWeb3React()
  const { address: recipientAddress } = useENS(recipientAddressOrName)
  const recipient = recipientAddressOrName === null ? account : recipientAddress

  const deadline = useTransactionDeadline()
  const addPendingOrder = useAddPendingOrder()

  return useMemo(() => {
    if (!trade || !library || !account || !chainId) {
      return { state: SwapCallbackState.INVALID, callback: null, error: 'Missing dependencies' }
    }
    if (!recipient) {
      if (recipientAddressOrName !== null) {
        return { state: SwapCallbackState.INVALID, callback: null, error: 'Invalid recipient' }
      } else {
        return { state: SwapCallbackState.LOADING, callback: null, error: null }
      }
    }

    return {
      state: SwapCallbackState.VALID,
      callback: async function onSwap(): Promise<string> {
        const { executionPrice, inputAmount, nextMidPrice, outputAmount, priceImpact, route, tradeType } = trade

        const slippagePercent = new Percent(allowedSlippage.toString(10), '10000')
        const routeDescription = route.path.map(token => token.symbol || token.name || token.address).join(' → ')

        console.log(
          `[useSwapCallback] Trading ${routeDescription}. Input = ${inputAmount.toExact()}, Output = ${outputAmount.toExact()}, Price = ${executionPrice.toFixed()}, Details: `,
          {
            inputAmount: inputAmount.toExact(),
            outputAmount: outputAmount.toExact(),
            executionPrice: executionPrice.toFixed(),
            deadline: deadline ? new Date(deadline.toNumber() * 1000).toISOString() : undefined,
            maximumAmountIn: trade.maximumAmountIn(slippagePercent).toExact(),
            minimumAmountOut: trade.minimumAmountOut(slippagePercent).toExact(),
            nextMidPrice: nextMidPrice.toFixed(),
            priceImpact: priceImpact.toSignificant(),
            tradeType: tradeType.toString(),
            allowedSlippage,
            slippagePercent: slippagePercent.toFixed() + '%',
            recipient,
            recipientAddressOrName,
            chainId
          }
        )
        return postOrder({
          account,
          chainId,
          trade,
          deadline,
          recipient,
          recipientAddressOrName,
          addPendingOrder
        })
      },
      error: null
    }
  }, [trade, library, account, chainId, recipient, allowedSlippage, recipientAddressOrName])
}
