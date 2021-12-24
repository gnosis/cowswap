import CowProtocolLogo from 'components/CowProtocolLogo'
import { useActiveWeb3React } from 'hooks/web3'
import { useUserAvailableClaims } from 'state/claim/hooks'
import { getPaidClaims, getFreeClaims, parseClaimAmount } from 'state/claim/hooks/utils'
import { ClaimTable, ClaimAccount, ClaimBreakdown } from 'pages/Claim/styled'
import { typeToCurrencyMapper } from 'state/claim/hooks/utils'

export const ClaimsTable = () => {
  const { account, chainId } = useActiveWeb3React()
  const claimData = useUserAvailableClaims(account)

  const freeClaims = getFreeClaims(claimData)
  const paidClaims = getPaidClaims(claimData)

  return (
    <ClaimBreakdown>
      <h2>vCOW claim breakdown</h2>
      <ClaimTable>
        <ClaimAccount>
          {/* [account web3 profile image OR identicon] */}
          <div></div>
          <span>
            <b>
              supercow.eth <span>(Connected account)</span>
            </b>
            <i>{account}</i>
          </span>
        </ClaimAccount>
        <table>
          <thead>
            <tr>
              <th>
                <label className="checkAll">
                  <input type="checkbox" name="check" />
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
            {freeClaims.map(({ index, type, amount }) => {
              return (
                <tr key={index}>
                  <td>
                    {' '}
                    <label className="checkAll">
                      <input type="checkbox" name="check" checked disabled />
                    </label>
                  </td>
                  <td>{type}</td>
                  <td width="150px">
                    <CowProtocolLogo size={16} />{' '}
                    {parseClaimAmount(amount, chainId)?.toFixed(0, { groupSeparator: ',' })} vCOW
                  </td>
                  <td>-</td>
                  <td>
                    <span className="green">Free!</span>
                  </td>
                  <td>No</td>
                  <td>28 days, 10h, 50m</td>
                </tr>
              )
            })}

            {paidClaims.map(({ index, type, amount }) => {
              const currency = typeToCurrencyMapper(type, chainId)

              return (
                <tr key={index}>
                  <td>
                    {' '}
                    <label className="checkAll">
                      <input type="checkbox" name="check" />
                    </label>
                  </td>
                  <td>Investment opportunity: Buy vCOW with {currency}</td>
                  <td>{parseClaimAmount(amount, chainId)?.toFixed(0, { groupSeparator: ',' })} vCOW</td>
                  <td>16.66 vCoW per {currency}</td>
                  <td>2,500.04 {currency}</td>
                  <td>4 Years (linear)</td>
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
