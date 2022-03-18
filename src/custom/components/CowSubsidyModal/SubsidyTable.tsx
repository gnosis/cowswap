import styled from 'styled-components/macro'
import { formatSmartLocaleAware } from 'utils/format'
import { ClaimTr } from 'pages/Claim/ClaimsTable'
import { COW_SUBSIDY_DATA } from './constants'
import { CowBalanceProps } from '../CowBalance'
import { transparentize } from 'polished'
import { FlyoutRowActiveIndicator } from '../Header/NetworkSelector'

import { BigNumber } from 'bignumber.js'
import { formatUnits } from '@ethersproject/units'
import { V_COW } from 'constants/tokens'
import { SupportedChainId } from 'constants/chains'

const StyledSubsidyTable = styled.table`
  width: 100%;
`

const SubsidyTr = styled(ClaimTr)<{ selected?: boolean }>`
  position: relative;
  ${({ selected, theme }) =>
    selected &&
    `
    background: ${transparentize(0.7, theme.primary1)};

    
    > td {
      border: 1.2px solid ${theme.primary1};
      color: ${theme.primary1};
      font-weight: 500;

      > ${FlyoutRowActiveIndicator} {
        position: absolute;
        left: 8%;

        background-color: ${theme.primary1};
        box-shadow: 0px 0px 8px ${transparentize(0.3, theme.primary1)};
      }

      &:first-child {
        border-right: none;

        display: flex;
        align-items: center; 
        justify-content: center;
      }
      &:last-child {
        border-left: none;
      }
    }
  `}

  > th {
    font-weight: 300;
  }
  > td,
  th {
    padding: 10px;
    text-align: center;
  }
`

const COW_DECIMALS = V_COW[SupportedChainId.MAINNET].decimals
const TABLE_HEADERS = ['(v)COW balance', 'Fee discount']

function SubsidyTable({ subsidy }: Pick<CowBalanceProps, 'subsidy'>) {
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
        {/* DATA IS IN ATOMS */}
        {COW_SUBSIDY_DATA.map(([threshold, discount], i) => {
          const selected = subsidy.discount === discount
          const formattedThreshold = new BigNumber(formatUnits(threshold, COW_DECIMALS))

          return (
            <SubsidyTr key={discount + '_' + i} selected={selected}>
              <td>
                {selected && <FlyoutRowActiveIndicator active />}
                {/* if index != 0, show prefix '>' */}
                <span>{i && '>' + formatSmartLocaleAware(formattedThreshold)}</span>
              </td>
              <td>{discount}%</td>
            </SubsidyTr>
          )
        })}
      </tbody>
    </StyledSubsidyTable>
  )
}

export default SubsidyTable
