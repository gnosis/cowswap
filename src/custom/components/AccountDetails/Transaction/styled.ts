import styled from 'styled-components'
import { StyledSVG } from 'components/Loader'
import { LinkStyledButton } from 'theme'
import { TransactionState as OldTransactionState } from '../TransactionMod'
import { RowFixed } from 'components/Row'

export const Wrapper = styled.div`
  display: flex;
  flex-flow: column wrap;
  width: 100%;
  border-bottom: 1px solid #d9e8ef;

  ${({ theme }) => theme.mediaWidth.upToSmall`
  border-bottom: 2px solid #d9e8ef;
`}
`

export const IconType = styled.div`
  height: 36px;
  width: 36px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    display: none;
`};

  &::before {
    content: '';
    display: block;
    background: ${({ color }) => color};
    position: absolute;
    top: 0;
    left: 0;
    height: inherit;
    width: inherit;
    border-radius: 36px;
    opacity: 0.1;
  }
  svg {
    display: flex;
    margin: auto;
  }
  svg > path {
    width: 100%;
    height: 100%;
    object-fit: contain;
    margin: auto;
    display: block;
    fill: ${({ color }) => color};
  }
  // Loader
  ${StyledSVG} {
    > path {
      fill: transparent;
      stroke: ${({ color }) => color};
    }
  }
`

export const Summary = styled.div`
  display: flex;
  flex-flow: column wrap;
  color: ${({ theme }) => theme.text2};

  > b {
    color: inherit;
    font-weight: normal;
    line-height: 1;
    font-size: 15px;
    margin: 0 0 5px;
    text-transform: capitalize;

    ${({ theme }) => theme.mediaWidth.upToSmall`
    margin: 0 0 12px;
    font-weight: bold;
  `}
  }
`

export const SummaryInner = styled.div`
  display: flex;
  flex-flow: column wrap;
  width: 100%;
  opacity: 0.75;
  font-size: 13px;
`

export const SummaryInnerRow = styled.div<{ isExpired?: boolean; isCancelled?: boolean }>`
  display: grid;
  color: inherit;
  grid-template-rows: 1fr;
  grid-template-columns: 90px 1fr;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    grid-template-columns: 1fr; 
    grid-template-rows: max-content max-content; 
    margin: 0 16px 8px 0;
`};

  > b,
  > i {
    position: relative;
    font-size: inherit;
    font-weight: 500;
    margin: 0;
    color: inherit;
    display: flex;
    align-items: center;
    font-style: normal;
  }

  > b {
    padding: 0;
    font-weight: 500;
    opacity: 0.8;

    &:before {
      content: '▶';
      margin: 0 5px 0 0;
      color: ${({ theme }) => theme.text2};
      font-size: 8px;
    }
  }

  > i {
    word-break: break-all;
    white-space: break-spaces;
    text-decoration: ${({ isExpired, isCancelled }) => (isExpired || isCancelled) && 'line-through'};

    ${({ theme }) => theme.mediaWidth.upToSmall`
      font-weight: 600;
      margin: 4px 0 0 12px;
    `};
  }
`

export const TransactionStatusText = styled.div`
  margin: 0 auto 0 16px;
  display: flex;
  align-items: center;

  ${({ theme }) => theme.mediaWidth.upToMedium`
  margin: 0 auto 0 0;
`};

  &:hover {
    text-decoration: none;
  }
`

export const StatusLabelWrapper = styled.div`
  display: flex;
  flex-flow: column wrap;
  flex: 0 1 auto;
  justify-content: center;
`

export const StatusLabel = styled.div<{ isPending: boolean }>`
  height: 28px;
  width: 100px;
  border: ${({ isPending, theme }) => isPending && `1px solid ${theme.border2}`};
  color: ${({ color }) => color};
  position: relative;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;

  &::before {
    content: '';
    background: ${({ color, isPending }) => (isPending ? 'transparent' : color)};
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    width: 100%;
    border-radius: 4px;
    opacity: 0.1;
  }

  > svg {
    margin: 0 5px 0 0;
  }
`

export const TransactionWrapper = styled.div`
  width: 100%;
  border-radius: 0;
  font-size: initial;
  display: flex;
  margin: 0;
  padding: 16px;
  transition: background 0.2s ease-in-out;

  &:hover {
    background: rgba(217, 232, 239, 0.35);
  }
`

export const StatusLabelBelow = styled.div<{ isCancelling?: boolean }>`
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 12px;
  line-height: 1.1;
  margin: 7px auto 0;
  color: ${({ isCancelling, theme }) => (isCancelling ? theme.primary1 : 'inherit')};

  ${LinkStyledButton} {
    margin: 2px 0;
  }
`

// override the href, pending and success props
// override mouse actions via CSS when we dont want a clickable row
export const TransactionState = styled(OldTransactionState).attrs(
  (props): { href?: string; disableMouseActions?: boolean; pending?: boolean; success?: boolean } => props
)`
  ${(props): string | false => !!props.disableMouseActions && `pointer-events: none; cursor: none;`}
  width: 100%;
  border-radius: 0;
  font-size: initial;
  display: flex;
  margin: 0;
  padding: 0;

  ${RowFixed} {
    width: 100%;
  }
`

export const CancellationSummary = styled.span`
  padding: 12px;
  margin: 0;
  border-radius: 6px;
  background: ${({ theme }) => theme.bg4};
`

export const TransactionAlertMessage = styled.div`
  width: 100%;
  padding: 0;
  background: ${({ theme }) => theme.yellow};
  color: black;
  font-size: 13px;
  display: flex;
  justify-content: center;

  > p {
    padding: 10px;
    margin: 0;
    margin: 0 auto;
  }

  > p > a {
    color: ${({ theme }) => theme.primary1};
  }
`
