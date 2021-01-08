import { CurrencyAmount } from '@uniswap/sdk'

import { useTransactionAdder } from '@src/state/transactions/hooks'

import { Contract } from 'ethers'

export function useWrapEther() {
  const addTransaction = useTransactionAdder()

  return async (amount: CurrencyAmount, weth: Contract): Promise<string> => {
    console.log('Wrapping ETH!', amount.raw.toString(), weth)

    try {
      const txReceipt = await weth.deposit({ value: `0x${amount.raw.toString(16)}` })
      addTransaction(txReceipt, { summary: `Wrap ${amount.toSignificant(6)} ETH to WETH` })
      console.log('Wrapped!', amount)
      return txReceipt
    } catch (error) {
      console.error('Could not WRAP', error)
      return 'Failed to wrap'
    }
  }
}
