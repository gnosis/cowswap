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

import Row from 'components/Row'
import { ExternalLink } from 'components/Link'

import CowBalance, { CowBalanceProps } from '../CowBalance'
import SubsidyTable from './SubsidyTable'
import { SUBSIDY_INFO_MESSAGE } from './constants'

// TODO: remove, testing imports
import useCowBalanceAndSubsidy from 'hooks/useCowBalanceAndSubsidy'

const CowSubsidyInfo = ({ account, balance, subsidy }: CowBalanceProps) => (
  <AutoColumn style={{ marginTop: 20, padding: '2rem 0' }} gap="24px" justify="center">
    <Text fontWeight={500} fontSize={16} style={{ textAlign: 'center', width: '85%', wordBreak: 'break-word' }}>
      {SUBSIDY_INFO_MESSAGE}
    </Text>
    {/* VCOW LOGO */}
    <CowBalance account={account} balance={balance} subsidy={subsidy} />
    <SubsidyTable subsidy={subsidy} />
  </AutoColumn>
)

export default function CowSubsidyModal({
  isOpen,
  onDismiss,
  ...restProps
}: Pick<ConfirmationModalProps, 'isOpen'> & Omit<ConfirmationModalContentProps, 'title' | 'topContent'>) {
  const { account, chainId } = useActiveWeb3React()

  // TODO: update with latest code
  const { subsidy, balance } = useCowBalanceAndSubsidy()

  const TopContent = useCallback(
    () => <CowSubsidyInfo account={account ?? undefined} balance={balance} subsidy={subsidy} />,
    [account, balance, subsidy]
  )

  const BottomContent = useCallback(
    () => (
      <Row style={{ justifyContent: 'center' }}>
        {/* TODO: fix this href, also is this an external link?? */}
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
