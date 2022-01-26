import { PhishAlert } from 'components/Header/URLWarning'
import { NETWORK_LABELS, SupportedChainId } from 'constants/chains'
import { useMemo } from 'react'
import { useClaimState } from 'state/claim/hooks'
import styled from 'styled-components/macro'

export const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: left;
`

export default function ClaimsOnOtherChainsBanner() {
  const { hasClaimsOnOtherChains } = useClaimState()
  const chainsWithClaims: SupportedChainId[] = useMemo(
    () =>
      Object.keys(hasClaimsOnOtherChains).reduce((acc, chain) => {
        const checkedChain = chain as unknown as SupportedChainId
        const chainHasClaim = hasClaimsOnOtherChains[checkedChain]
        if (!chainHasClaim) return acc

        acc.push(checkedChain)
        return acc
      }, [] as SupportedChainId[]),
    [hasClaimsOnOtherChains]
  )

  if (chainsWithClaims.length === 0) {
    return null
  }

  return (
    <PhishAlert isActive>
      <Wrapper>
        You have available claims on{' '}
        {chainsWithClaims.map((chainId) => (
          <span key={chainId}>{NETWORK_LABELS[chainId]} </span>
        ))}
      </Wrapper>
    </PhishAlert>
  )
}
