import { useState, useEffect } from 'react'
import { Trans } from '@lingui/macro'
import { useActiveWeb3React } from 'hooks/web3'
import { useUserAvailableClaims, FREE_CLAIM_TYPES } from 'state/claim/hooks'
import CowProtocolLogo from 'components/CowProtocolLogo'
import { parseClaimAmount } from 'state/claim/hooks/utils'
import { ExternalLink } from 'theme'
import { ClaimTable, ClaimBreakdown, CheckAddress, PageWrapper, InputField } from 'pages/Claim/styled'
import { typeToCurrencyMapper, isFreeClaim, getFreeClaims } from 'state/claim/hooks/utils'

export default function Claim() {
  const { account, chainId } = useActiveWeb3React()

  const [inputAddress, setInputAddress] = useState<string | null | undefined>('')
  const [activeAddress, setActiveAddress] = useState<string | null | undefined>('')

  // get user claim data
  const userClaimData = useUserAvailableClaims(activeAddress)
  const sortedClaimData = userClaimData.sort(
    (a, b) => +FREE_CLAIM_TYPES.includes(b.type) - +FREE_CLAIM_TYPES.includes(a.type)
  )

  const [selected, setSelected] = useState<number[]>(getFreeClaims(userClaimData).map(({ index }) => index))

  const handleSelect = (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const checked = event.target.checked
    const output = [...selected]
    checked ? output.push(index) : output.splice(output.indexOf(index), 1)
    setSelected(output)
  }

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    const checked = event.target.checked
    const all = userClaimData.map(({ index }) => index)
    const free = getFreeClaims(userClaimData).map(({ index }) => index)
    setSelected(checked ? all : free)
  }

  useEffect(() => {
    if (!activeAddress && account) {
      setActiveAddress(account)
    }
  }, [account, activeAddress])

  return (
    <PageWrapper>
      {!!userClaimData.length && (
        <ClaimBreakdown>
          <h2>vCOW claim breakdown</h2>
          <ClaimTable>
            <table>
              <thead>
                <tr>
                  <th>
                    <label className="checkAll">
                      <input onChange={handleSelectAll} type="checkbox" name="check" />
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
                  const currency = typeToCurrencyMapper(type, chainId)

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
                        <CowProtocolLogo size={16} />{' '}
                        {parseClaimAmount(amount, chainId)?.toFixed(0, { groupSeparator: ',' })} vCOW
                      </td>
                      <td>{isFree ? '-' : `16.66 vCoW per ${currency}`}</td>
                      <td>{isFree ? <span className="green">Free!</span> : `2,500.04 ${currency}`}</td>
                      <td>{type === 'Airdrop' ? 'No' : '4 years (linear)'}</td>
                      <td>28 days, 10h, 50m</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </ClaimTable>
        </ClaimBreakdown>
      )}

      {!activeAddress && (
        <CheckAddress>
          <p>
            Enter an address to check for any eligible vCOW claims{' '}
            <ExternalLink href="#">
              <Trans>or connect a wallet</Trans>
            </ExternalLink>
          </p>
          <InputField>
            <b>Input address</b>
            <input
              placeholder="Address or ENS name"
              value={inputAddress || ''}
              onChange={(e) => setInputAddress(e.currentTarget.value)}
            />
          </InputField>
          {/* {!isInputAddressValid && 'Incorrect address'} */}
        </CheckAddress>
      )}
    </PageWrapper>
  )
}
