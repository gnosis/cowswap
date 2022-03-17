import { useCallback, useMemo } from 'react'
import {
  ConfirmationModalContent,
  ConfirmationModalContentProps,
  ConfirmationModalProps,
} from 'components/TransactionConfirmationModal'
import { useActiveWeb3React } from 'hooks/web3'
import { GpModal } from 'components/Modal'
import { AutoColumn } from 'components/SearchModal/CommonBases'
import { Text } from 'rebass'

import { V_COW } from 'constants/tokens'

import Row from 'components/Row'
import { ExternalLink } from 'components/Link'

import CowBalance, { CowBalanceProps } from '../CowBalance'
import SubsidyTable from './SubsidyTable'
import { SUBSIDY_INFO_MESSAGE } from './constants'

// TODO: remove, testing imports
import { SupportedChainId } from '@src/custom/constants/chains'
import { CurrencyAmount } from '@uniswap/sdk-core'
import { parseUnits } from '@ethersproject/units'
import { getDiscountFromBalance } from './utils'
import { BigNumber } from 'bignumber.js'

const CowSubsidyInfo = ({ account, balance, tier }: CowBalanceProps) => (
  <AutoColumn style={{ marginTop: 20, padding: '2rem 0' }} gap="24px" justify="center">
    <Text fontWeight={500} fontSize={16} style={{ textAlign: 'center', width: '85%', wordBreak: 'break-word' }}>
      {SUBSIDY_INFO_MESSAGE}
    </Text>
    {/* VCOW LOGO */}
    <CowBalance account={account} balance={balance} tier={tier} />
    <SubsidyTable tier={tier} />
  </AutoColumn>
)

const MOCK_BALANCE = CurrencyAmount.fromRawAmount(
  V_COW[SupportedChainId.RINKEBY],
  parseUnits('1000', V_COW[SupportedChainId.MAINNET].decimals).toString()
)

export default function CowSubsidyModal({
  isOpen,
  onDismiss,
  ...restProps
}: Pick<ConfirmationModalProps, 'isOpen'> & Omit<ConfirmationModalContentProps, 'title' | 'topContent'>) {
  const { account, chainId } = useActiveWeb3React()

  // TODO: vcow and cow balance from @nenadV91
  /* const vCow =  */ chainId ? V_COW[chainId] : undefined
  const balance = MOCK_BALANCE // useTotalCowBalance(account || undefined, vCow)

  const tier = useMemo(() => {
    const balanceBn = new BigNumber(balance.toExact())
    return getDiscountFromBalance(balanceBn)
  }, [balance])

  const TopContent = useCallback(
    () => <CowSubsidyInfo account={account ?? undefined} balance={balance} tier={tier} />,
    [account, balance, tier]
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
