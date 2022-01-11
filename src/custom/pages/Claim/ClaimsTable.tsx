import { useMemo } from 'react'
import { ClaimType, useClaimState, UserClaimData, FREE_CLAIM_TYPES } from 'state/claim/hooks'
import { isFreeClaim, parseClaimAmount, getTypeToCurrencyMap, getTypeToPriceMap } from 'state/claim/hooks/utils'
import { ClaimTable, ClaimBreakdown } from 'pages/Claim/styled'
import CowProtocolLogo from 'components/CowProtocolLogo'
import { useActiveWeb3React } from 'hooks/web3'
import { ClaimStatus } from '@src/custom/state/claim/actions'

type ClaimsTableProps = {
  handleSelectAll: (event: React.ChangeEvent<HTMLInputElement>) => void
  handleSelect: (event: React.ChangeEvent<HTMLInputElement>, index: number) => void
  userClaimData: UserClaimData[]
  isAirdropOnly: boolean
  hasClaims: boolean
}

export default function ClaimsTable({
  handleSelectAll,
  handleSelect,
  userClaimData,
  isAirdropOnly,
  hasClaims,
}: ClaimsTableProps) {
  const { selectedAll, selected, activeClaimAccount, claimStatus, isInvestFlowActive } = useClaimState()
  const { chainId } = useActiveWeb3React()

  // claim type to currency and price map
  const typeToCurrencyMap = useMemo(() => getTypeToCurrencyMap(chainId), [chainId])
  const typeToPriceMap = useMemo(() => getTypeToPriceMap(), [])

  const sortedClaimData = useMemo(
    () => userClaimData.sort((a, b) => +FREE_CLAIM_TYPES.includes(b.type) - +FREE_CLAIM_TYPES.includes(a.type)),
    [userClaimData]
  )

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
            {sortedClaimData.map(({ index, type, amount }) => {
              const isFree = isFreeClaim(type)
              const currency = typeToCurrencyMap[type] || ''
              const vCowPrice = typeToPriceMap[type]
              const parsedAmount = parseClaimAmount(amount, chainId)
              const cost = vCowPrice * Number(parsedAmount?.toSignificant(6))

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
                  <td>{isFree ? type : `Buy vCOW with ${currency}`}</td>
                  <td width="150px">
                    <CowProtocolLogo size={16} /> {parsedAmount?.toFixed(0, { groupSeparator: ',' })} vCOW
                  </td>
                  <td>{isFree ? '-' : `${vCowPrice} vCoW per ${currency}`}</td>
                  <td>{isFree ? <span className="green">Free!</span> : `${cost} ${currency}`}</td>
                  <td>{type === ClaimType.Airdrop ? 'No' : '4 years (linear)'}</td>
                  <td>28 days, 10h, 50m</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </ClaimTable>
    </ClaimBreakdown>
  )
}
