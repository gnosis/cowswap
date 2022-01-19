import { ClaimType } from 'state/claim/hooks'
import { TokenLogo } from 'pages/Claim/styled'
import { EnhancedUserClaimData } from 'pages/Claim/types'
import CowProtocolLogo from 'components/CowProtocolLogo'
import { formatSmart } from 'utils/format'

export type Props = { claim: EnhancedUserClaimData }

export function InvestSummaryRow(props: Props): JSX.Element | null {
  const { claim } = props

  const { isFree, type, price, claimAmount, currencyAmount } = claim

  const symbol = isFree ? '' : (currencyAmount?.currency?.symbol as string)

  return (
    <tr>
      <td>
        {isFree ? (
          <b>{ClaimType[type]}</b>
        ) : (
          <>
            <TokenLogo symbol={symbol} size={32} />
            <CowProtocolLogo size={32} />
            <span>
              <b>Buy vCOW</b>
              <i>with {symbol}</i>
            </span>
          </>
        )}
      </td>

      <td>
        {!isFree && (
          <span>
            {/* TODO: get investment amount and calculate percentage of maxCost */}
            <b>Investment amount:</b> <i>1343 {symbol} (50% of available investing opportunity)</i>
          </span>
        )}
        <span>
          <b>Amount to receive:</b>
          {/* TODO: claimAmount only for free claims, need to calculate for paid claims */}
          <i>{formatSmart(claimAmount) || '0'} vCOW</i>
        </span>
      </td>

      <td>
        {!isFree && (
          <span>
            <b>Price:</b>{' '}
            <i>
              {formatSmart(price) || '0'} vCoW per {symbol}
            </i>
          </span>
        )}
        <span>
          {/* TODO: calculate proper cost */}
          <b>Cost:</b> <i>{isFree ? 'Free!' : `${formatSmart(currencyAmount) || '0'} ${symbol}`}</i>
        </span>
        <span>
          <b>Vesting:</b>
          <i>{type === ClaimType.Airdrop ? 'No' : '4 years (linear)'}</i>
        </span>
      </td>
    </tr>
  )
}
