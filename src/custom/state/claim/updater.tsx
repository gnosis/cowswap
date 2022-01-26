import { useEffect } from 'react'
import { SupportedChainId } from 'constants/chains'
import { supportedChainId } from 'utils/supportedChainId'
import { useActiveWeb3React } from 'hooks/web3'
import { fetchClaims, useClaimDispatchers } from './hooks'

const SUPPORTED_CLAIM_CHAINS = [SupportedChainId.MAINNET, SupportedChainId.XDAI]

export default function Updater() {
  const { account, chainId } = useActiveWeb3React()
  const { setHasClaimsOnOtherChains } = useClaimDispatchers()

  useEffect(() => {
    if (!account) return

    const supportedChain = supportedChainId(chainId)
    SUPPORTED_CLAIM_CHAINS.forEach((chain) => {
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
  }, [account, chainId, setHasClaimsOnOtherChains])

  return null
}
