import React from 'react'
import styled, { css } from 'styled-components'
import loadingCowGif from 'assets/cow-swap/cow-load.gif'
import useLoadingWithTimeout from 'hooks/useLoadingWithTimeout'
import { useIsQuoteRefreshing } from 'state/price/hooks'

export interface ArrowWrapperProps {
  children: React.ReactNode
}

export function ArrowWrapperLoader({ children }: ArrowWrapperProps) {
  const COW_LOADING_TIME = 4000
  const isRefreshingQuote = useIsQuoteRefreshing()
  const showLoader = useLoadingWithTimeout(isRefreshingQuote, COW_LOADING_TIME)
  // const showLoader = true
  return (
    <Wrapper showLoader={showLoader}>
      {children}
      {showLoader && <img src={loadingCowGif} alt="Loading prices..." />}
    </Wrapper>
  )
}

export const Wrapper = styled.div<{ showLoader: boolean }>`
  position: absolute;
  z-index: 2;
  background: ${({ theme }) => theme.swap.arrowDown.background};
  border-radius: ${({ theme }) => theme.swap.arrowDown.borderRadius};
  width: ${({ theme }) => theme.swap.arrowDown.width};
  height: ${({ theme }) => theme.swap.arrowDown.height};
  display: flex;
  align-items: center;
  justify-content: center;
  border: ${({ theme }) => `${theme.swap.arrowDown.borderSize} solid ${theme.swap.arrowDown.borderColor}`};
  transition: transform 0.1s ease-in-out;
  padding: 0;
  cursor: pointer;
  transform-style: preserve-3d;
  transform-origin: center right;
  transition: transform 0.25s;

  &:hover {
    transform: translateY(1px);

    > svg {
      stroke: ${({ theme }) => theme.swap.arrowDown.colorHover};
    }
  }

  > svg {
    stroke: ${({ theme }) => theme.swap.arrowDown.color};
    backface-visibility: hidden;

    ${({ showLoader }) =>
      showLoader
        ? css`
            animation: slideout 1s linear 1;
          `
        : null}
  }

  > img {
    height: 100%;
    width: 100%;
    object-fit: contain;
    padding: 2px 2px 0;
    object-position: bottom;
    backface-visibility: hidden;
    transform: rotateY(180deg);
    ${({ showLoader }) => (showLoader ? css`` : null)}
  }

  ${({ showLoader }) =>
    showLoader
      ? css`
          cursor: initial;
          position: absolute;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: visible;
          padding: 0;
          border: transparent;
          z-index: initial;
          transform: translateX(-100%) rotateY(-180deg);

          &::before,
          &::after {
            content: '';
            position: absolute;
            left: -2px;
            top: -2px;
            background: linear-gradient(
              45deg,
              #e57751,
              #c5daef,
              #275194,
              ${({ theme }) => theme.bg4},
              #c5daef,
              #1b5a7a
            );
            background-size: 800%;
            width: calc(100% + 4px);
            height: calc(100% + 4px);
            z-index: 2;
            animation: steam 7s linear infinite;
            border-radius: 11px;
          }

          &::after {
            filter: blur(10px);
          }

          @keyframes steam {
            0% {
              background-position: 0 0;
            }
            50% {
              background-position: 400% 0;
            }
            100% {
              background-position: 0 0;
            }
          }
        `
      : null}
`
