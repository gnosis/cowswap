import styled from 'styled-components/macro'
import { Trans } from '@lingui/macro'
import { CurrencyAmount, Currency } from '@uniswap/sdk-core'

import { AMOUNT_PRECISION } from 'constants/index'
import { ClaimSummaryTitle, ClaimTotal, ClaimSummary as ClaimSummaryWrapper } from 'pages/Claim/styled'
import { formatMax, formatSmartLocaleAware } from 'utils/format'
import CowProtocolLogo from 'components/CowProtocolLogo'

const Wrapper = styled(ClaimSummaryWrapper)`
  border-radius: 100px;
`

export interface CowBalanceProps {
  account: string
  balance?: CurrencyAmount<Currency>
  title?: string
}

const CowBalance = ({ account, balance, title }: CowBalanceProps) => {
  return (
    <Wrapper>
      <CowProtocolLogo size={100} />

      {title && (
        <ClaimSummaryTitle>
          <Trans>{title}</Trans>
        </ClaimSummaryTitle>
      )}

      {balance && !account && (
        <div>
          <ClaimTotal>
            <b>Your combined balance</b>
            <p title={`${formatMax(balance, balance.currency.decimals)} vCOW`}>
              {' '}
              {formatSmartLocaleAware(balance, AMOUNT_PRECISION) || '0'} (v)COW
            </p>
          </ClaimTotal>
        </div>
      )}
    </Wrapper>
  )
}

export default CowBalance
