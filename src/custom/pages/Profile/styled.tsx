import styled, { css } from 'styled-components/macro'
import Page, { GdocsListStyle, Title } from 'components/Page'
import * as CSS from 'csstype'
import { transparentize } from 'polished'
import { ExternalLink } from 'theme'

export const Container = styled.div`
  max-width: 910px;
  width: 100%;
`
export const Wrapper = styled(Page)`
  ${GdocsListStyle}

  max-width: 910px;
  width: 100%;
  min-height: auto;
  padding-top: 16px;
  display: flex;
  justify-content: flex-end;
  flex-direction: column;
  margin: 0;
  background: ${({ theme }) => transparentize(0.5, theme.bg1)};
  box-shadow: none;
  border: 1px solid ${({ theme }) => theme.cardBorder};
  ${({ theme }) => theme.mediaWidth.upToSmall`
    padding: 16px;
  `}
  span[role='img'] {
    font-size: 55px;
    ${({ theme }) => theme.mediaWidth.upToSmall`
      font-size: 30px;
    `}
  }
`

export const ExtLink = styled(ExternalLink)`
  color: ${({ theme }) => theme.text1};
  font-weight: 300;
  &:hover,
  &:focus {
    color: ${({ theme }) => theme.text1};
  }
`

export const ChildWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-grow: 1;
  justify-content: center;
  border-radius: 21px;
  padding: 20px;
  ${({ theme }) => theme.neumorphism.boxShadow};
  background-color: ${({ theme }) => theme.bg7};
  ${({ theme }) => theme.mediaWidth.upToSmall`
    grid-column-start: 1;
    grid-column-end: 2;
    width: 100%;
    padding: 14px;
  `}
  > .item {
    width: 100%;
    flex-direction: row;
  }
`

export const GridWrap = styled.div<Partial<CSS.Properties & { horizontal?: boolean }>>`
  display: grid;
  grid-column-gap: 22px;
  grid-row-gap: 22px;
  grid-template-columns: ${(props) => (props.horizontal ? '1fr 1fr' : '1fr')};
  ${({ theme }) => theme.mediaWidth.upToSmall`
  grid-template-columns: 1fr;
  grid-column-gap: 16px;
  grid-row-gap: 16px;
    grid-column-gap: 0;
    > :first-child,
    > :nth-child(2) {
      grid-column-start: 1;
      grid-column-end: 2;
    }
  `};
`

export const CardHead = styled.div`
  display: flex;
  flex-grow: 1;
  flex-wrap: wrap;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    flex-direction: column;
    flex-wrap: nowrap;
  `}
`

export const StyledTitle = styled(Title)`
  display: flex;
  justify-content: flex-start;
  margin: 0;
  line-height: 1.21;
  font-size: 26px;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    justify-content: center;
    font-size: 24px;
  `}
`

export const StyledTime = styled.p`
  margin: 0;
`

export const ItemTitle = styled.h3`
  display: flex;
  align-items: center;
  margin: 0 0 16px 0;
  font-size: 18px;
  line-height: 1.21;
  color: ${({ theme }) => theme.text1};
  ${({ theme }) => theme.mediaWidth.upToSmall`
    margin: 0 0 10px 0;
    font-size: 16px;
  `}
`

export const FlexRow = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
`

export const FlexWrap = styled.div<Partial<CSS.Properties & { xAlign?: string; yAlign?: string; col?: boolean }>>`
  display: flex;
  flex-grow: 1;
  flex-direction: ${(props) => (props.col ? 'column' : 'row')};
  flex-wrap: ${(props) => (props.col ? 'nowrap' : 'wrap')};
  ${(props) => props.xAlign && `justify-content: ${props.xAlign};`}
  ${(props) => props.yAlign && `align-items: ${props.yAlign};`}
  ${({ theme }) => theme.mediaWidth.upToSmall`
    flex-direction: column;
    flex-wrap:  nowrap;
    align-items: center;
    button {
      max-width: 100%;
    }
  `}
  button {
    max-width: 180px;
  }
`

export const StyledContainer = styled.div`
  display: flex;
  flex:1;
  align-items:center;
  justify-content: space-between;
  }
  ${({ theme }) => theme.mediaWidth.upToSmall`
    flex-wrap: wrap;
    flex-direction: column;
  `}
`

export const Loader = styled.div<{ isLoading: boolean }>`
  display: flex;
  flex: 1;
  ${({ theme, isLoading }) =>
    isLoading &&
    css`
      position: relative;
      display: inline-block;

      overflow: hidden;
      &::after {
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        transform: translateX(-100%);
        background-image: linear-gradient(
          90deg,
          rgba(255, 255, 255, 0) 0,
          ${theme.shimmer1} 20%,
          ${theme.shimmer2} 60%,
          rgba(255, 255, 255, 0)
        );
        animation: shimmer 2s infinite;
        content: '';
      }

      @keyframes shimmer {
        100% {
          transform: translateX(100%);
        }
      }
    `}
`
