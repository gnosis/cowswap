import React from 'react'
import styled from 'styled-components'
import loadingCowGif from 'assets/cow-swap/cow-load.gif'

interface ArrowWrapperProps {
  showLoader: boolean
  children: any
}

function ArrowWrapper({ showLoader, children }): ArrowWrapperProps {
  return (
    <>
      {children}
      <b>{showLoader}</b>
      <img src={loadingCowGif} alt="Loading prices..." />
    </>
  )
}

export const ArrowWrapperLoader = styled(ArrowWrapper)<{ showLoader: boolean }>`
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

  &:hover {
    transform: translateY(1px);

    > svg {
      stroke: ${({ theme }) => theme.swap.arrowDown.colorHover};
    }
  }

  > svg {
    stroke: ${({ theme }) => theme.swap.arrowDown.color};
  }

  > img {
    height: 100%;
    width: 100%;
    object-fit: contain;
    padding: 2px 2px 0;
    object-position: bottom;
  }

  ${({ showLoader }) =>
    showLoader
      ? css`
          cursor: initial;
          position: absolute;
          border-radius: 9px;
          width: 28px;
          height: 28px;
          display: flex;
          -webkit-box-align: center;
          align-items: center;
          -webkit-box-pack: center;
          justify-content: center;
          transition: transform 0.1s ease-in-out 0s;
          background: #112644;
          overflow: visible;
          padding: 0;
          border: transparent;
          z-index: initial;

          &::before,
          &::after {
            content: '';
            position: absolute;
            left: -2px;
            top: -2px;
            background: linear-gradient(90deg, #183861, rgb(94 121 154));
            background-size: 800%;
            width: calc(100% + 4px);
            height: calc(100% + 4px);
            z-index: -2;
            animation: steam 7s linear infinite;
            border-radius: 11px;
          }
        `
      : null}
`
