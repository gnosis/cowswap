import React, { useContext, useMemo } from 'react'
import { AlertCircle, CheckCircle } from 'react-feather'
import styled, { ThemeContext } from 'styled-components'
import { useActiveWeb3React } from 'hooks'
import { TYPE, ExternalLink } from 'theme'
import { AutoColumn } from 'components/Column'
import { AutoRow } from 'components/Row'
import { getEtherscanLink, getExplorerLabel } from 'utils'

const RowNoFlex = styled(AutoRow)`
  flex-wrap: nowrap;
`

export default function TransactionPopup({
  hash,
  success,
  summary
}: {
  hash: string
  success?: boolean
  summary?: string
}) {
  const { chainId } = useActiveWeb3React()

  const theme = useContext(ThemeContext)

  const [transactionUrl, hashToDisplay, transactionLabel] = useMemo(
    () => [
      chainId && getEtherscanLink(chainId, hash, 'transaction'),
      hash.slice(0, 8) + '...' + hash.slice(58, 65),
      chainId && getExplorerLabel(chainId, hash, 'transaction')
    ],
    [chainId, hash]
  )

  return (
    <RowNoFlex>
      <div style={{ paddingRight: 16 }}>
        {success ? <CheckCircle color={theme.green1} size={24} /> : <AlertCircle color={theme.red1} size={24} />}
      </div>
      <AutoColumn gap="8px">
        <TYPE.body fontWeight={500}>{summary ?? 'Hash: ' + hashToDisplay}</TYPE.body>
        {transactionUrl && <ExternalLink href={transactionUrl}>{transactionLabel}</ExternalLink>}
      </AutoColumn>
    </RowNoFlex>
  )
}
