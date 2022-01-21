import { useMemo, useCallback } from 'react'
import { Currency } from '@uniswap/sdk-core'
import { TransactionResponse } from '@ethersproject/providers'
import { calculateGasMargin } from 'utils/calculateGasMargin'
import { useActiveWeb3React } from 'hooks/web3'
import { useTransactionAdder } from 'state/enhancedTransactions/hooks'
import { ApproveCallbackParams, APPROVE_GAS_LIMIT_DEFAULT } from './useApproveCallback/useApproveCallbackMod'
import { useTokenContract } from './useContract'
import { useTokenAllowance } from 'hooks/useTokenAllowance'
import { OptionalApproveCallbackParams } from './useApproveCallback'

export default function useRevokeApproveCallback({
  openTransactionConfirmationModal,
  closeModals,
  spender,
  token,
}: Pick<ApproveCallbackParams, 'closeModals' | 'openTransactionConfirmationModal' | 'spender'> & {
  token?: Currency
}): [boolean, ({ transactionSummary }: OptionalApproveCallbackParams) => Promise<void>] {
  const { account, chainId } = useActiveWeb3React()
  const currentAllowance = useTokenAllowance(token?.wrapped, account ?? undefined, spender)

  // check the current approval status
  const isApproved: boolean = useMemo(() => {
    if (!spender || !token || token.isNative || currentAllowance?.equalTo('0')) return false

    return true
  }, [currentAllowance, spender, token])

  const tokenContract = useTokenContract(token?.wrapped.address)
  const addTransaction = useTransactionAdder()

  const approve = useCallback(
    async ({ transactionSummary }: OptionalApproveCallbackParams): Promise<void> => {
      if (!isApproved) {
        console.error('No approval, no need to revoke approval.')
        return
      }
      if (!chainId) {
        console.error('no chainId')
        return
      }

      if (!token) {
        console.error('no token')
        return
      }

      if (!tokenContract) {
        console.error('tokenContract is null')
        return
      }

      if (!spender) {
        console.error('no spender')
        return
      }

      const estimatedGas = await tokenContract.estimateGas.approve(spender, '0').catch(() => {
        // general fallback for tokens who restrict approval amounts
        return tokenContract.estimateGas.approve(spender, '0').catch((error) => {
          console.log(
            '[useApproveCallbackMod] Error estimating gas for approval. Using default gas limit ' +
              APPROVE_GAS_LIMIT_DEFAULT.toString(),
            error
          )
          return APPROVE_GAS_LIMIT_DEFAULT
        })
      })

      openTransactionConfirmationModal(`Revoke ${token.symbol} approval from ${spender}`)
      return (
        tokenContract
          .approve(spender, '0', {
            gasLimit: calculateGasMargin(chainId, estimatedGas),
          })
          .then((response: TransactionResponse) => {
            addTransaction({
              hash: response.hash,
              summary: transactionSummary || `Revoke ${token.symbol} approval from ${spender}`,
              approval: { tokenAddress: token.wrapped.address, spender },
            })
          })
          // .catch((error: Error) => {
          //   console.debug('Failed to approve token', error)
          //   throw error
          // })
          .finally(closeModals)
      )
    },
    [isApproved, chainId, token, tokenContract, spender, openTransactionConfirmationModal, closeModals, addTransaction]
  )

  return [isApproved, approve]
}
