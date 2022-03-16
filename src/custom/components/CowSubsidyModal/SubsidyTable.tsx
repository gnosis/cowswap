import styled from 'styled-components/macro'
import { formatSmartLocaleAware } from 'utils/format'
import { ClaimTr } from 'pages/Claim/ClaimsTable'
import { BigNumber } from 'bignumber.js'

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

function SubsidyTable({ data }: { data: (string | number)[][] }) {
  const headers = data[0]
  const body = data.slice(1)

  return (
    <StyledSubsidyTable>
      <thead>
        <SubsidyTr>
          {headers.map((header, i) => (
            <th key={header + '_' + i}>{header}</th>
          ))}
        </SubsidyTr>
      </thead>
      <tbody>
        {body.map(([threshold, discount], i) => (
          <SubsidyTr key={discount + '_' + i}>
            <td>&gt;{formatSmartLocaleAware(new BigNumber(threshold))}</td>
            <td>{discount}%</td>
          </SubsidyTr>
        ))}
      </tbody>
    </StyledSubsidyTable>
  )
}

export default SubsidyTable
