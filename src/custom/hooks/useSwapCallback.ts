import { SwapCallbackState } from '@src/hooks/useSwapCallback'
import { INITIAL_ALLOWED_SLIPPAGE } from 'constants/index'

import { useSwapCallback as useSwapCallbackUniswap } from '@src/hooks/useSwapCallback'
import { Trade } from '@uniswap/sdk'

export function useSwapCallback(
  trade: Trade | undefined, // trade to execute, required
  allowedSlippage: number = INITIAL_ALLOWED_SLIPPAGE, // in bips
  recipientAddressOrName: string | null // the ENS name or address of the recipient of the trade, or null if swap should be returned to sender
): { state: SwapCallbackState; callback: null | (() => Promise<string>); error: string | null } {
  return useSwapCallbackUniswap(trade, allowedSlippage, recipientAddressOrName)
}
