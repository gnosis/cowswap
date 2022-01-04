// import JSBI from 'jsbi'
// import { CurrencyAmount, Token } from '@uniswap/sdk-core'
// import { TransactionResponse } from '@ethersproject/providers'
// import { useEffect, useState } from 'react'
// import { UNI } from 'constants/tokens'
// import { useActiveWeb3React } from 'hooks/web3'
// import { useMerkleDistributorContract } from 'hooks/useContract'
// import { calculateGasMargin } from 'utils/calculateGasMargin'
// import { useSingleCallResult } from 'state/multicall/hooks'
import { isAddress } from 'utils/index'
// import { useTransactionAdder } from 'state/enhancedTransactions/hooks'
import { RepoClaims, UserClaims } from '.'
import { transformRepoClaimsToUserClaims } from 'state/claim/hooks/utils'
// import { useSingleCallResult } from '@src/state/multicall/hooks'
export { useUserClaimData } from '@src/state/claim/hooks'

// Mock data
import mockClaimData from './mocks/claimData'

// interface UserClaimData {
//   index: number
//   amount: string
//   proof: string[]
//   flags?: {
//     isSOCKS: boolean
//     isLP: boolean
//     isUser: boolean
//   }
// }

type LastAddress = string
type ClaimAddressMapping = { [firstAddress: string]: LastAddress }
// let FETCH_CLAIM_MAPPING_PROMISE: Promise<ClaimAddressMapping> | null = null
function fetchClaimsMapping(): Promise<ClaimAddressMapping> {
  // return (
  //   FETCH_CLAIM_MAPPING_PROMISE ??
  //   (FETCH_CLAIM_MAPPING_PROMISE = fetch(`${CLAIMS_REPO}mapping.json`) // mod
  //     .then((res) => res.json())
  //     .catch((error) => {
  //       console.error('Failed to get claims mapping', error)
  //       FETCH_CLAIM_MAPPING_PROMISE = null
  //     }))
  // )
  return Promise.resolve({ '0x00059034c8759f5C89af6792Eb3cFa2CCd12f6f3': '0x01bE7C603f60ae4b69BeC96816DBAC548cd784E6' })
}

// const FETCH_CLAIM_FILE_PROMISES: { [startingAddress: string]: Promise<{ [address: string]: RepoClaims }> } = {} // mod
function fetchClaimsFile(key: string): Promise<{ [address: string]: RepoClaims }> {
  console.log(`fetching key`, key)
  // return (
  //   FETCH_CLAIM_FILE_PROMISES[key] ??
  //   (FETCH_CLAIM_FILE_PROMISES[key] = fetch(`${CLAIMS_REPO}${key}.json`) // mod
  //     .then((res) => res.json())
  //     .catch((error) => {
  //       console.error(`Failed to get claim file mapping for starting address ${key}`, error)
  //       delete FETCH_CLAIM_FILE_PROMISES[key]
  //     }))
  // )
  return Promise.resolve(mockClaimData)
}

const FETCH_CLAIM_PROMISES: { [key: string]: Promise<UserClaims> } = {}

// returns the claim for the given address, or null if not valid
export function fetchClaims(account: string): Promise<UserClaims> {
  const formatted = isAddress(account)
  if (!formatted) return Promise.reject(new Error('Invalid address'))

  return (
    FETCH_CLAIM_PROMISES[account] ??
    (FETCH_CLAIM_PROMISES[account] = fetchClaimsMapping()
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .then((mapping) => {
        // const sorted = Object.keys(mapping).sort((a, b) => (a.toLowerCase() < b.toLowerCase() ? -1 : 1))

        // for (const startingAddress of sorted) {
        //   const lastAddress = mapping[startingAddress]
        //   if (startingAddress.toLowerCase() <= formatted.toLowerCase()) {
        //     if (formatted.toLowerCase() <= lastAddress.toLowerCase()) {
        //       return startingAddress
        //     }
        //   } else {
        //     throw new Error(`Claim for ${formatted} was not found in partial search`)
        //   }
        // }
        // throw new Error(`Claim for ${formatted} was not found after searching all mappings`)
        return 'just going to ignore this nicely'
      })
      .then(fetchClaimsFile)
      .then((result) => {
        if (result[formatted]) return transformRepoClaimsToUserClaims(result[formatted]) // mod
        throw new Error(`Claim for ${formatted} was not found in claim file!`)
      })
      .catch((error) => {
        console.debug('Claim fetch failed', error)
        throw error
      }))
  )
}

// parse distributorContract blob and detect if user has claim data
// null means we know it does not
// export function useUserClaimData(account: string | null | undefined): UserClaimData | null {
//   const { chainId } = useActiveWeb3React()
//
//   const [claimInfo, setClaimInfo] = useState<{ [account: string]: UserClaimData | null }>({})
//
//   useEffect(() => {
//     if (!account || chainId !== 1) return
//
//     fetchClaim(account)
//       .then((accountClaimInfo) =>
//         setClaimInfo((claimInfo) => {
//           return {
//             ...claimInfo,
//             [account]: accountClaimInfo,
//           }
//         })
//       )
//       .catch(() => {
//         setClaimInfo((claimInfo) => {
//           return {
//             ...claimInfo,
//             [account]: null,
//           }
//         })
//       })
//   }, [account, chainId])
//
//   return account && chainId === 1 ? claimInfo[account] : null
// }

// check if user is in blob and has not yet claimed UNI
// export function useUserHasAvailableClaim(account: string | null | undefined): boolean {
//   const userClaimData = useUserClaimData(account)
//   const distributorContract = useMerkleDistributorContract()
//   const isClaimedResult = useSingleCallResult(distributorContract, 'isClaimed', [userClaimData?.index])
//   // user is in blob and contract marks as unclaimed
//   return Boolean(userClaimData && !isClaimedResult.loading && isClaimedResult.result?.[0] === false)
// }

// export function useUserUnclaimedAmount(account: string | null | undefined): CurrencyAmount<Token> | undefined {
//   const { chainId } = useActiveWeb3React()
//   const userClaimData = useUserClaimData(account)
//   const canClaim = useUserHasAvailableClaim(account)
//
//   const uni = chainId ? UNI[chainId] : undefined
//   if (!uni) return undefined
//   if (!canClaim || !userClaimData) {
//     return CurrencyAmount.fromRawAmount(uni, JSBI.BigInt(0))
//   }
//   return CurrencyAmount.fromRawAmount(uni, JSBI.BigInt(userClaimData.amount))
// }

// export function useClaimCallback(account: string | null | undefined): {
//   claimCallback: () => Promise<string>
// } {
//   // get claim data for this account
//   const { library, chainId } = useActiveWeb3React()
//   const claimData = useUserClaimData(account)
//
//   // used for popup summary
//   const unclaimedAmount: CurrencyAmount<Token> | undefined = useUserUnclaimedAmount(account)
//   const addTransaction = useTransactionAdder()
//   const distributorContract = useMerkleDistributorContract()
//
//   const claimCallback = async function () {
//     if (!claimData || !account || !library || !chainId || !distributorContract) return
//
//     const args = [claimData.index, account, claimData.amount, claimData.proof]
//
//     return distributorContract.estimateGas['claim'](...args, {}).then((estimatedGasLimit) => {
//       return distributorContract
//         .claim(...args, { value: null, gasLimit: calculateGasMargin(chainId, estimatedGasLimit) })
//         .then((response: TransactionResponse) => {
//           addTransaction(response, {
//             summary: `Claimed ${unclaimedAmount?.toSignificant(4)} UNI`,
//             claim: { recipient: account },
//           })
//           return response.hash
//         })
//     })
//   }
//
//   return { claimCallback }
// }
