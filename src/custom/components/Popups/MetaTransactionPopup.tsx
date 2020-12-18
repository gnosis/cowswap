import React, { useContext } from 'react'
import { AlertCircle, CheckCircle } from 'react-feather'
import styled, { ThemeContext } from 'styled-components'
import { useActiveWeb3React } from 'hooks'
import { TYPE } from 'theme'
import { ExternalLink } from 'theme'
import { AutoColumn } from 'components/Column'
import { AutoRow } from 'components/Row'

const RowNoFlex = styled(AutoRow)`
  flex-wrap: nowrap;
`

const getOrderLink = (id: string) => {
  return `https://protocol-rinkeby.dev.gnosisdev.com/api/v1/orders/${id}`
}

export default function MetaTransactionPopup({
  id,
  success,
  summary
}: {
  id: string
  success?: boolean
  summary?: string
}) {
  const { chainId } = useActiveWeb3React()

  const theme = useContext(ThemeContext)

  return (
    <RowNoFlex>
      <div style={{ paddingRight: 16 }}>
        {success ? <CheckCircle color={theme.green1} size={24} /> : <AlertCircle color={theme.red1} size={24} />}
      </div>
      <AutoColumn gap="8px">
        <TYPE.body fontWeight={500}>{summary ?? 'ID: ' + id.slice(0, 8) + '...' + id.slice(58, 65)}</TYPE.body>
        {chainId && <ExternalLink href={getOrderLink(id)}>View on Etherscan</ExternalLink>}
      </AutoColumn>
    </RowNoFlex>
  )
}
