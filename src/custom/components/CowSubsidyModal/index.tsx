import { useCallback } from 'react'
import { CurrencyAmount } from '@uniswap/sdk-core'
import {
  ConfirmationModalContent,
  ConfirmationModalContentProps,
  ConfirmationModalProps,
} from 'components/TransactionConfirmationModal'
import { useActiveWeb3React } from 'hooks/web3'
import { GpModal } from 'components/Modal'
import { AutoColumn } from 'components/SearchModal/CommonBases'
import { Text } from 'rebass'

import { useClaimState } from 'state/claim/hooks'
import { useTokenBalance } from 'state/wallet/hooks'
import { V_COW, WETH9_EXTENDED } from 'constants/tokens'

import { SupportedChainId } from 'constants/chains'
import Row from 'components/Row'
import { ExternalLink } from 'components/Link'

import { COW_SUBSIDY } from 'constants/subsidy'
import CowBalance, { CowBalanceProps } from '../CowBalance'
import SubsidyTable from './SubsidyTable'

// TODO: remove this
const MOCK_BALANCE = CurrencyAmount.fromRawAmount(
  WETH9_EXTENDED[SupportedChainId.MAINNET].wrapped,
  '123123123123123123123'
)
const CowSubsidyInfo = ({ account, balance = MOCK_BALANCE }: CowBalanceProps) => (
  <AutoColumn style={{ marginTop: 20, padding: '2rem 0' }} gap="24px" justify="center">
    <Text fontWeight={500} fontSize={16} style={{ textAlign: 'center', width: '85%', wordBreak: 'break-word' }}>
      As a (v)COW token holder you will be eligbible for a fee discount.
    </Text>
    {/* VCOW LOGO */}
    <CowBalance account={account} balance={balance} />
    <SubsidyTable data={COW_SUBSIDY} />
  </AutoColumn>
)

export default function CowSubsidyModal({
  isOpen,
  onDismiss,
  ...restProps
}: Pick<ConfirmationModalProps, 'isOpen'> & Omit<ConfirmationModalContentProps, 'title' | 'topContent'>) {
  const { chainId } = useActiveWeb3React()

  const { activeClaimAccount } = useClaimState()
  const vCow = chainId ? V_COW[chainId] : undefined
  const vCowBalance = useTokenBalance(activeClaimAccount || undefined, vCow)

  const TopContent = useCallback(
    () => <CowSubsidyInfo account={activeClaimAccount} balance={vCowBalance} />,
    [activeClaimAccount, vCowBalance]
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
