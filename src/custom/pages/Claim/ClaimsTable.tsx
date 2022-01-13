import { ClaimType, useClaimState } from 'state/claim/hooks'
import { ClaimTable, ClaimBreakdown } from 'pages/Claim/styled'
import CowProtocolLogo from 'components/CowProtocolLogo'
import { ClaimStatus } from 'state/claim/actions'
import { UserClaimDataDetails } from './types'
import { formatSmart } from 'utils/format'

type ClaimsTableProps = {
  handleSelectAll: (event: React.ChangeEvent<HTMLInputElement>) => void
  handleSelect: (event: React.ChangeEvent<HTMLInputElement>, index: number) => void
  userClaimData: UserClaimDataDetails[]
  isAirdropOnly: boolean
  hasClaims: boolean
}

type ClaimsTableRowProps = UserClaimDataDetails &
  Pick<ClaimsTableProps, 'handleSelect'> & {
    selected: number[]
  }

const ClaimsTableRow = ({
  index,
  type,
  isFree,
  currencyAmount,
  currency,
  price,
  cost,
  handleSelect,
  selected,
}: ClaimsTableRowProps) => {
  return (
    <tr key={index}>
      <td>
        {' '}
        <label className="checkAll">
          <input
            onChange={(event) => handleSelect(event, index)}
            type="checkbox"
            name="check"
            checked={isFree || selected.includes(index)}
            disabled={isFree}
          />
        </label>
      </td>
      <td>{isFree ? ClaimType[type] : `Buy vCOW with ${currency}`}</td>
      <td width="150px">
        <CowProtocolLogo size={16} /> {formatSmart(currencyAmount) || 0} vCOW
      </td>
      <td>{isFree || !price ? '-' : `${formatSmart(price) || 0} vCoW per ${currency}`}</td>
      <td>{isFree ? <span className="green">Free!</span> : `${formatSmart(cost) || 0} ${currency}`}</td>
      <td>{type === ClaimType.Airdrop ? 'No' : '4 years (linear)'}</td>
      <td>28 days, 10h, 50m</td>
    </tr>
  )
}

export default function ClaimsTable({
  handleSelectAll,
  handleSelect,
  userClaimData,
  isAirdropOnly,
  hasClaims,
}: ClaimsTableProps) {
  const { selectedAll, selected, activeClaimAccount, claimStatus, isInvestFlowActive } = useClaimState()

  if (isAirdropOnly || !hasClaims || !activeClaimAccount) return null
  if (claimStatus !== ClaimStatus.DEFAULT || isInvestFlowActive) return null

  return (
    <ClaimBreakdown>
      <h2>vCOW claim breakdown</h2>
      <ClaimTable>
        <table>
          <thead>
            <tr>
              <th>
                <label className="checkAll">
                  <input checked={selectedAll} onChange={handleSelectAll} type="checkbox" name="check" />
                </label>
              </th>
              <th>Type of Claim</th>
              <th>Amount</th>
              <th>Price</th>
              <th>Cost</th>
              <th>Vesting</th>
              <th>Ends in</th>
            </tr>
          </thead>
          <tbody>
            {userClaimData.map((claim) => (
              <ClaimsTableRow key={claim.index} {...claim} selected={selected} handleSelect={handleSelect} />
            ))}
          </tbody>
        </table>
      </ClaimTable>
    </ClaimBreakdown>
  )
}
