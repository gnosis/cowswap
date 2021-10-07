import { useCallback } from 'react'

import { Token } from '@uniswap/sdk-core'

import { useActiveWeb3React } from '@src/hooks/web3'
import { getBytes32TokenContract, getTokenContract, useMulticall2Contract } from 'hooks/useContract'
import { CallParams, getMultipleCallsResults } from 'state/multicall/utils'
import { parseStringOrBytes32 } from '@src/hooks/Tokens'
import { useAddUserToken } from '@src/state/user/hooks'

/**
 * Hook that exposes a function for lazy (non-hook) fetching tokens info async
 *
 * Similar to useToken, except it fetches multiple tokens at once, and does it after component hook phase
 */
export function useTokensLazy() {
  const { library, account, chainId } = useActiveWeb3React()
  const multicall2Contract = useMulticall2Contract()
  const addUserToken = useAddUserToken()

  return useCallback(
    async (addresses: string[], withSignerIfPossible?: boolean): Promise<Record<string, Token | null> | null> => {
      if (!library || !account || !chainId || !multicall2Contract) {
        console.warn(`useTokensLazy::not initialized`)
        return null
      }

      // TODO: maybe we'll need to bach these queries if searching for too many tokens at once?
      const callsParams = addresses.reduce<CallParams[]>((acc, address) => {
        const tokenContract = getTokenContract(address, withSignerIfPossible, library, account, chainId)
        const tokenContractBytes32 = getBytes32TokenContract(address, withSignerIfPossible, library, account, chainId)

        // For every address, create 5 queries
        // Merge them into a single array to be used by the multicall contract
        return acc.concat([
          {
            contract: tokenContract,
            methodName: 'name',
          },
          {
            contract: tokenContract,
            methodName: 'symbol',
          },
          {
            contract: tokenContract,
            methodName: 'decimals',
          },
          {
            contract: tokenContractBytes32,
            methodName: 'name',
          },
          {
            contract: tokenContractBytes32,
            methodName: 'symbol',
          },
        ])
      }, [])

      // Single multicall to all tokens
      const results = await getMultipleCallsResults({
        callsParams,
        multicall2Contract,
      })

      // Map addresses list into map where the address is the key and the value is the Token obj or null
      return addresses.reduce<Record<string, Token | null>>((acc, address, index) => {
        // Each token sent 5 queries, so we navigate the results 5 by 5
        const [tokenName, symbol, decimals, tokenNameBytes32, symbolBytes32] = results.slice(index * 5, (index + 1) * 5)

        if (!decimals) {
          console.warn(`useTokensLazy::no decimals for token ${address}`)
          acc[address] = null
        } else {
          const token = new Token(
            chainId,
            address,
            decimals[0],
            parseStringOrBytes32(symbol?.[0], symbolBytes32?.[0], 'UNKNOWN'),
            parseStringOrBytes32(tokenName?.[0], tokenNameBytes32?.[0], 'Unknown Token')
          )
          // Adding new token to the list of User tokens
          addUserToken(token)

          acc[address] = token
        }

        return acc
      }, {})
    },
    [account, addUserToken, chainId, library, multicall2Contract]
  )
}
