import { useCallback } from 'react'
import {
  ConfirmationModalContent,
  ConfirmationModalContentProps,
  ConfirmationModalProps,
} from 'components/TransactionConfirmationModal'
import { useActiveWeb3React } from 'hooks/web3'
import { GpModal } from 'components/Modal'
import { AutoColumn } from 'components/SearchModal/CommonBases'
import { Text } from 'rebass'

import { useTokenBalance } from 'state/wallet/hooks'
import { V_COW } from 'constants/tokens'

import Row from 'components/Row'
import { ExternalLink } from 'components/Link'

import CowBalance, { CowBalanceProps } from '../CowBalance'
import SubsidyTable from './SubsidyTable'
import { SUBSIDY_INFO_MESSAGE } from './constants'

const CowSubsidyInfo = ({ account, balance }: CowBalanceProps) => (
  <AutoColumn style={{ marginTop: 20, padding: '2rem 0' }} gap="24px" justify="center">
    <Text fontWeight={500} fontSize={16} style={{ textAlign: 'center', width: '85%', wordBreak: 'break-word' }}>
      {SUBSIDY_INFO_MESSAGE}
    </Text>
    {/* VCOW LOGO */}
    <CowBalance account={account} balance={balance} />
    <SubsidyTable />
  </AutoColumn>
)

export default function CowSubsidyModal({
  isOpen,
  onDismiss,
  ...restProps
}: Pick<ConfirmationModalProps, 'isOpen'> & Omit<ConfirmationModalContentProps, 'title' | 'topContent'>) {
  const { account, chainId } = useActiveWeb3React()

  const vCow = chainId ? V_COW[chainId] : undefined
  // TODO: vcow and cow balance from @nenadV91
  const vCowBalance = useTokenBalance(account || undefined, vCow)

  const TopContent = useCallback(
    () => <CowSubsidyInfo account={account ?? undefined} balance={vCowBalance} />,
    [account, vCowBalance]
  )

  const BottomContent = useCallback(
    () => (
      <Row style={{ justifyContent: 'center' }}>
        <ExternalLink href="google.com">Read more about the tokenomics</ExternalLink>
      </Row>
    ),
    []
  )

  if (!chainId) return null

  return (
    <GpModal isOpen={isOpen} onDismiss={onDismiss} maxHeight={90}>
      <ConfirmationModalContent
        {...restProps}
        title="CoWmunity fees discount"
        onDismiss={onDismiss}
        topContent={TopContent}
        bottomContent={BottomContent}
      />
    </GpModal>
  )
}
