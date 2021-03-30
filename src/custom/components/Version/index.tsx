import React from 'react'
import styled from 'styled-components'
import { ExternalLink, TYPE } from 'theme'

import { version as WEB } from '@src/../package.json'
import { version as CONTRACTS } from '@gnosis.pm/gp-v2-contracts/package.json'

const VERSIONS: Record<string, { version: string; href: string }> = {
  Web: {
    version: 'v' + WEB,
    href: 'https://github.com/gnosis/gp-swap-ui'
  },
  Contracts: {
    version: 'v' + CONTRACTS,
    href: 'https://github.com/gnosis/gp-v2-contracts'
  }
}

const versionsList = Object.keys(VERSIONS)

const StyledPolling = styled.div`
  position: fixed;
  display: flex;
  flex-flow: row nowrap;
  align-items: flex-start;
  gap: 0.5rem;

  left: 0;
  bottom: 0;

  padding: 1rem;

  color: ${({ theme }) => theme.version};
  opacity: 0.4;

  &:hover {
    opacity: 1;
  }

  transition: opacity 0.25s ease;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    display: none;
  `}
`

const VersionsExternalLink = styled(ExternalLink)<{ isUnclickable?: boolean }>`
  ${({ isUnclickable = false }): string | false =>
    isUnclickable &&
    `
      pointer-events: none;
      cursor: none;
  `}
`

const Version = () => (
  <StyledPolling>
    {/* it's hardcoded anyways */}
    {versionsList.map(key => {
      const { href, version } = VERSIONS[key]
      return (
        <TYPE.small key={key}>
          <VersionsExternalLink href={href}>
            <strong>{key}</strong>: {version}
          </VersionsExternalLink>
        </TYPE.small>
      )
    })}
  </StyledPolling>
)

export default Version
