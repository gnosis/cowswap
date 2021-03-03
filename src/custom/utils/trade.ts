import { ChainId, CurrencyAmount, Token } from '@uniswap/sdk'
import { isAddress, shortenAddress } from '@src/utils'
import { AddPendingOrderParams, OrderStatus, OrderKind } from 'state/orders/actions'

import { signOrder, UnsignedOrder } from 'utils/signatures'
import { postSignedOrder } from 'utils/operator'
import { BigNumberish, Signer } from 'ethers'
import { APP_ID, RADIX_DECIMAL, SHORTEST_PRECISION } from 'constants/index'

export interface PostOrderParams {
  account: string
  chainId: ChainId
  signer: Signer
  kind: OrderKind
  inputAmount: CurrencyAmount
  adjustedInputAmount: CurrencyAmount
  outputAmount: CurrencyAmount
  adjustedOutputAmount: CurrencyAmount
  feeAmount: BigNumberish
  sellToken: Token
  buyToken: Token
  validTo: number
  recipient: string
  recipientAddressOrName: string | null
  addPendingOrder: (order: AddPendingOrderParams) => void
}
interface DetermineInputOutputParams<T> {
  kind: string | 'sell' | 'buy'
  inputAmount: T
  outputAmount: T
}

export function determineInputOutput({
  kind,
  inputAmount,
  outputAmount
}: DetermineInputOutputParams<string>): { input: string; output: string; quantifier: string }
export function determineInputOutput({
  kind,
  inputAmount,
  outputAmount
}: DetermineInputOutputParams<CurrencyAmount>): { input: CurrencyAmount; output: CurrencyAmount; quantifier: string }
export function determineInputOutput({
  kind,
  inputAmount,
  outputAmount
}: DetermineInputOutputParams<CurrencyAmount | string>) {
  const input = kind === 'sell' ? inputAmount : outputAmount
  const output = kind === 'sell' ? outputAmount : inputAmount
  const quantifier = kind === 'sell' ? 'at least' : 'at most'

  return {
    input,
    output,
    quantifier
  }
}

function _getSummary(params: PostOrderParams): string {
  const { kind, inputAmount, adjustedOutputAmount, account, recipient, recipientAddressOrName } = params

  const { input, output, quantifier } = determineInputOutput({ inputAmount, outputAmount: adjustedOutputAmount, kind })

  const inputSymbol = input.currency.symbol
  const outputSymbol = output.currency.symbol
  const inputAmountValue = input.toSignificant(SHORTEST_PRECISION)
  const outputAmountValue = output.toSignificant(SHORTEST_PRECISION)

  const base = `Swap ${inputAmountValue} ${inputSymbol} for ${quantifier} ${outputAmountValue} ${outputSymbol}`

  if (recipient === account) {
    return base
  } else {
    const toAddress =
      recipientAddressOrName && isAddress(recipientAddressOrName)
        ? shortenAddress(recipientAddressOrName)
        : recipientAddressOrName

    return `${base} to ${toAddress}`
  }
}

export async function postOrder(params: PostOrderParams): Promise<string> {
  const {
    kind,
    addPendingOrder,
    chainId,
    // fee adjusted input
    adjustedInputAmount,
    // slippage output
    adjustedOutputAmount,
    sellToken,
    buyToken,
    feeAmount,
    validTo,
    account,
    signer
  } = params

  // fee adjusted input amount
  const sellAmount = adjustedInputAmount.raw.toString(RADIX_DECIMAL)
  // slippage adjusted output amount
  const buyAmount = adjustedOutputAmount.raw.toString(RADIX_DECIMAL)

  // Prepare order
  const summary = _getSummary(params)
  const unsignedOrder: UnsignedOrder = {
    sellToken: sellToken.address,
    buyToken: buyToken.address,
    sellAmount,
    buyAmount,
    validTo,
    appData: APP_ID,
    feeAmount,
    kind,
    partiallyFillable: false // Always fill or kill
  }

  const signature = await signOrder({
    chainId,
    signer,
    order: unsignedOrder
  })
  const creationTime = new Date().toISOString()

  // Call API
  const orderId = await postSignedOrder({
    chainId,
    order: {
      ...unsignedOrder,
      signature
    }
  })

  // Update the state
  addPendingOrder({
    chainId,
    id: orderId,
    order: {
      ...unsignedOrder,
      id: orderId,
      owner: account,
      creationTime,
      signature,
      status: OrderStatus.PENDING,
      summary,
      inputToken: sellToken,
      outputToken: buyToken
    }
  })

  return orderId
}
