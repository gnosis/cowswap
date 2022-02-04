import { useEffect } from 'react'
import { SupportedChainId } from 'constants/chains'
import { ClassifiedUserClaims, useClaimDispatchers, useClaimState, useClassifiedUserClaims } from './hooks'
import { useActiveWeb3React } from 'hooks'
import { ChainClaimsCount } from 'state/claim/reducer'

export default function Updater() {
  const { chainId } = useActiveWeb3React()
  const { activeClaimAccount } = useClaimState()
  const { setClaimsCount } = useClaimDispatchers()

  // Fetches all classified claims for mainnet and gchain
  const mainnetClaims = useClassifiedUserClaims(activeClaimAccount, SupportedChainId.MAINNET)
  const gChainClaims = useClassifiedUserClaims(activeClaimAccount, SupportedChainId.XDAI)

  useEffect(() => {
    // Counts the claims, based on which is the current network
    const mainnetCount = _countClaims(mainnetClaims, chainId, SupportedChainId.MAINNET)
    const gChainCount = _countClaims(gChainClaims, chainId, SupportedChainId.XDAI)

    // Stores it on redux
    setClaimsCount({
      chain: SupportedChainId.MAINNET,
      claimsCount: mainnetCount,
    })
    setClaimsCount({
      chain: SupportedChainId.XDAI,
      claimsCount: gChainCount,
    })
  }, [setClaimsCount, chainId, mainnetClaims, gChainClaims])

  return null
}

/**
 * Counts claims per network
 */
function _countClaims(
  mainnetClaims: ClassifiedUserClaims,
  currentChainId: number | undefined,
  chainId: SupportedChainId
) {
  const { available, claimed, expired } = mainnetClaims

  const count: Partial<ChainClaimsCount> = {
    // Total is easy, just add everything up
    // This will always be accurate.
    // When we only have airdrop repo as reference, everything will be `available`
    // Otherwise the sum of all categories
    total: claimed.length + available.length + expired.length,
  }
  // Only if we are in the network we want to check we are able to do smart contract calls
  // and fetch contract data
  // Otherwise the count would be replaced with outdated info
  if (currentChainId === chainId) {
    count.available = available.length
    count.expired = expired.length
    count.claimed = claimed.length
  }
  return count
}
