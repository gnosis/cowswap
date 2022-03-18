import styled from 'styled-components/macro'
import { formatSmartLocaleAware } from 'utils/format'
import { ClaimTr } from 'pages/Claim/ClaimsTable'
import { BigNumber } from 'bignumber.js'
import { COW_SUBSIDY_DATA } from './constants'

const StyledSubsidyTable = styled.table`
  width: 100%;
`

const SubsidyTr = styled(ClaimTr)`
  > th {
    font-weight: 300;
  }
  > td,
  th {
    padding: 10px;
    text-align: center;
  }
`

const TABLE_HEADERS = ['(v)COW balance', 'Fee discount']

function SubsidyTable() {
  return (
    <StyledSubsidyTable>
      <thead>
        <SubsidyTr>
          {TABLE_HEADERS.map((header, i) => (
            <th key={header + '_' + i}>{header}</th>
          ))}
        </SubsidyTr>
      </thead>
      <tbody>
        {COW_SUBSIDY_DATA.map(([threshold, discount], i) => (
          <SubsidyTr key={discount + '_' + i}>
            {/* if index != 0, show prefix '>' */}
            <td>{i && '>' + formatSmartLocaleAware(new BigNumber(threshold))}</td>
            <td>{discount}%</td>
          </SubsidyTr>
        ))}
      </tbody>
    </StyledSubsidyTable>
  )
}

export default SubsidyTable
