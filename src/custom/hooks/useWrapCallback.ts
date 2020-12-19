import { useActiveWeb3React } from '@src/hooks'
import { Currency, CurrencyAmount, currencyEquals, ETHER, WETH } from '@uniswap/sdk'
import { useMemo } from 'react'
import { tryParseAmount } from 'state/swap/hooks'
import { useTransactionAdder } from 'state/transactions/hooks'
import { useCurrencyBalance } from 'state/wallet/hooks'
import { useWETHContract } from './useContract'

export enum WrapType {
  NOT_APPLICABLE,
  WRAP,
  UNWRAP
}

const NOT_APPLICABLE = { wrapType: WrapType.NOT_APPLICABLE }

interface WrapEther {
  sufficientBalance: boolean
  inputAmount?: CurrencyAmount
  wethContract: any
  addTransaction: Function
}

function wrapEther({ sufficientBalance, inputAmount, wethContract, addTransaction }: WrapEther) {
  return {
    wrapType: WrapType.WRAP,
    execute:
      sufficientBalance && inputAmount
        ? async () => {
            try {
              const txReceipt = await wethContract.deposit({ value: `0x${inputAmount.raw.toString(16)}` })
              addTransaction(txReceipt, { summary: `Wrap ${inputAmount.toSignificant(6)} ETH to WETH` })
            } catch (error) {
              console.error('Could not deposit', error)
            }
          }
        : undefined,
    inputError: sufficientBalance ? undefined : 'Insufficient ETH balance'
  }
}

/**
 * Given the selected input and output currency, return a wrap callback
 * @param inputCurrency the selected input currency
 * @param outputCurrency the selected output currency
 * @param typedValue the user input value
 */
export default function useWrapCallback(
  inputCurrency: Currency | undefined,
  outputCurrency: Currency | undefined,
  typedValue: string | undefined
): { wrapType: WrapType; execute?: undefined | (() => Promise<void>); inputError?: string } {
  const { chainId, account } = useActiveWeb3React()
  const wethContract = useWETHContract()
  const balance = useCurrencyBalance(account ?? undefined, inputCurrency)
  const etherBalance = useCurrencyBalance(account ?? undefined, ETHER)
  // we can always parse the amount typed as the input currency, since wrapping is 1:1
  const inputAmount = useMemo(() => tryParseAmount(typedValue, inputCurrency), [inputCurrency, typedValue])
  const addTransaction = useTransactionAdder()

  return useMemo(() => {
    if (!wethContract || !chainId || !inputCurrency || !outputCurrency) return NOT_APPLICABLE

    const sufficientBalance = !!(inputAmount && balance && !balance.lessThan(inputAmount))
    const sufficientEtherBalance = !!(inputAmount && etherBalance && !etherBalance.lessThan(inputAmount))

    // SELLING ETH for WETH
    // = WRAP
    if (inputCurrency === ETHER && currencyEquals(WETH[chainId], outputCurrency)) {
      return wrapEther({ sufficientBalance, inputAmount, wethContract, addTransaction })
      // SELLING WETH for ETH
      // = UNWRAP
    } else if (currencyEquals(WETH[chainId], inputCurrency) && outputCurrency === ETHER) {
      return {
        wrapType: WrapType.UNWRAP,
        execute:
          sufficientBalance && inputAmount
            ? async () => {
                try {
                  const txReceipt = await wethContract.withdraw(`0x${inputAmount.raw.toString(16)}`)
                  addTransaction(txReceipt, { summary: `Unwrap ${inputAmount.toSignificant(6)} WETH to ETH` })
                } catch (error) {
                  console.error('Could not withdraw', error)
                }
              }
            : undefined,
        inputError: sufficientBalance ? undefined : 'Insufficient WETH balance'
      }
      // SELLING WETH FOR WHATEVER (NOT ETHER)
      // AND INSUFFICIENT WETH BALANCE BUT ETHER BALANCE === SUFFICIENT
    } else if (
      // Input = WETH
      currencyEquals(WETH[chainId], inputCurrency) &&
      // User doesn't have enough for trade
      !sufficientBalance &&
      // User has ETHER balance and
      // ETHER balance is NOT less than input amount
      sufficientEtherBalance
    ) {
      // TODO: account for gas fee...
      return wrapEther({ sufficientBalance: sufficientEtherBalance, inputAmount, wethContract, addTransaction })
    } else {
      return NOT_APPLICABLE
    }
  }, [wethContract, chainId, inputCurrency, outputCurrency, inputAmount, balance, etherBalance, addTransaction])
}
