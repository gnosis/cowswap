import { useEffect } from 'react'
import { useBlockNumber } from '../application/hooks'
import { ALL_SUPPORTED_CHAIN_IDS } from 'constants/chains'
import { supportedChainId } from 'utils/supportedChainId'
import { useActiveWeb3React } from 'hooks/web3'
import { fetchClaims, useClaimDispatchers } from './hooks'

export default function Updater() {
  const { account, chainId } = useActiveWeb3React()
  const blockNumber = useBlockNumber()
  const { setHasClaimsOnOtherChains } = useClaimDispatchers()

  useEffect(() => {
    if (!account) return

    const supportedChain = supportedChainId(chainId)
    ALL_SUPPORTED_CHAIN_IDS.forEach((chain) => {
      if (supportedChain === chain) return
      // Chain at this point is a supported chain
      fetchClaims(account, chain)
        .then((userClaims) => {
          console.debug('[AvailbleClaimsUpdater]::Claim on', chain, userClaims)
          setHasClaimsOnOtherChains({ chain, hasClaims: true })
        })
        .catch((error) => {
          console.error('[AvailbleClaimsUpdater]::Error for chain', chain, error)
          setHasClaimsOnOtherChains({ chain, hasClaims: false })
        })
    })
  }, [account, blockNumber, chainId, setHasClaimsOnOtherChains])

  return null
}
