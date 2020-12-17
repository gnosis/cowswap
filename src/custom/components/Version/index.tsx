import React from 'react'
import styled from 'styled-components'
import { useActiveWeb3React } from 'hooks'
import { ExternalLink, TYPE } from 'theme'
import { GP_SETTLEMENT_CONTRACT_ADDRESS } from 'custom/constants'
import { getEtherscanLink } from 'utils'

const StyledPolling = styled.div`
  position: fixed;
  display: flex;
  flex-flow: column nowrap;
  align-items: flex-start;
  left: 0;
  bottom: 0;
  padding: 1rem;
  color: white;
  transition: opacity 0.25s ease;
  color: ${({ theme }) => theme.green1};
  :hover {
    opacity: 1;
  }

  ${({ theme }) => theme.mediaWidth.upToMedium`
    display: none;
  `}
`

type VERSIONS_MAP = Record<'WEB' | 'CONTRACTS', string>

const VERSIONS: VERSIONS_MAP = {
  WEB: '0.2.0-DEMO',
  CONTRACTS: '0.1.0-alpha10'
}

const VersionMap = new Map(Object.entries(VERSIONS))
const VersionList = Array.from(VersionMap)

const Version = () => {
  const { chainId } = useActiveWeb3React()

  const swapAddress = chainId ? GP_SETTLEMENT_CONTRACT_ADDRESS[chainId] : null

  return (
    <ExternalLink href={chainId && swapAddress ? getEtherscanLink(chainId, swapAddress, 'address') : ''}>
      <StyledPolling>
        {VersionList.map(([key, val]) => (
          <TYPE.small key={key}>
            {key}: {val}
          </TYPE.small>
        ))}
      </StyledPolling>
    </ExternalLink>
  )
}

export default Version
