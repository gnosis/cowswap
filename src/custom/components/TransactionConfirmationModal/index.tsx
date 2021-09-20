import { Currency } from '@uniswap/sdk-core'
import { useActiveWeb3React } from 'hooks/web3'
import { SupportedChainId as ChainId } from 'constants/chains'
import React, { ReactNode, useContext } from 'react'
import styled, { ThemeContext } from 'styled-components'
import { CloseIcon, CustomLightSpinner } from 'theme'
import { Trans } from '@lingui/macro'
import { ExternalLink } from 'theme'
import { RowBetween, RowFixed } from 'components/Row'
import MetaMaskLogo from 'assets/images/metamask.png'
import { getEtherscanLink, getExplorerLabel } from 'utils'
import { Text } from 'rebass'
import { ArrowUpCircle, CheckCircle } from 'react-feather'
import useAddTokenToMetamask from 'hooks/useAddTokenToMetamask'
import GameIcon from 'assets/cow-swap/game.gif'
import { Link } from 'react-router-dom'
import { ConfirmationModalContent as ConfirmationModalContentMod } from './TransactionConfirmationModalMod'
import { ColumnCenter } from 'components/Column'
import { lighten } from 'polished'
import SVG from 'react-inlinesvg'

const Wrapper = styled.div`
  width: 100%;

  .ud-loader__u {
    animation: fadein 1.5s cubic-bezier(1, 0.04, 0.46, 0.98);
  }
  .ud-loader--flip {
    width: 80px;
    height: 80px;
    position: relative;
    perspective: 100px;
    animation: zoom 1.5s cubic-bezier(1, 0.04, 0.46, 0.98);
  }
  .ud-loader--flip__content {
    width: 100%;
    height: 100%;
    position: absolute;
    transform-style: preserve-3d;
    transition: transform 3s;
    animation: rotate 3s 1s cubic-bezier(1, 0.04, 0.46, 0.98) infinite;
    padding: 16px;
  }
  .ud-loader--flip__side {
    display: block;
    position: absolute;
    width: 100%;
    height: 100%;
    backface-visibility: hidden;
  }
  .ud-loader--flip__side svg {
    width: 50px;
    height: 50px;
    object-fit: contain;
  }
  .ud-loader--flip__side--back {
    transform: rotateY(180deg);
  }
  @keyframes rotate {
    0% {
      transform: rotateY(0deg);
    }
    50% {
      transform: rotateY(180deg);
    }
    100% {
      transform: rotateY(360deg);
    }
  }
  @keyframes zoom {
    0% {
      transform: scale(0.8);
      opacity: 0;
    }
    50% {
      transform: scale(1);
      opacity: 1;
    }
    100% {
      transform: scale(1);
    }
  }
  .wrapper {
    margin: 0 auto 21px;
    display: flex;
    align-items: center;
    ${({ theme }) => theme.neumorphism.boxShadow}
    border-radius: 80px;
  }
`
const Section = styled.div`
  padding: 24px;
  align-items: center;
  justify-content: flex-start;
  display: flex;
  flex-flow: column wrap;
`

const CloseIconWrapper = styled(CloseIcon)`
  display: flex;
  margin: 16px 16px 0 auto;
  opacity: 0.75;
  transition: opacity 0.2s ease-in-out;

  &:hover {
    opacity: 1;
  }
`

const CloseLink = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.primary1};
  cursor: pointer;
  margin: 8px auto;
`

export const GPModalHeader = styled(RowBetween)`
  ${({ theme }) => theme.mediaWidth.upToSmall`
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    padding: 16px;
    background: ${({ theme }) => theme.bg1};
    z-index: 20;
  `}
`

const InternalLink = styled(Link)``

const StyledIcon = styled.img`
  height: auto;
  width: 20px;
  max-height: 100%;
  margin: 0 10px 0 0;
`

const ExternalLinkCustom = styled(ExternalLink)`
  margin: 12px auto 48px;
`

const ButtonGroup = styled.div`
  display: grid;
  align-items: center;
  justify-content: center;
  flex-flow: column wrap;
  margin: 12px 0 24px;
  width: 100%;
`

const ButtonCustom = styled.button`
  display: flex;
  flex: 1 1 auto;
  align-self: center;
  justify-content: center;
  align-items: center;
  border-radius: 16px;
  min-height: 52px;
  border: 1px solid ${({ theme }) => theme.border2};
  color: ${({ theme }) => theme.text1};
  background: transparent;
  outline: 0;
  padding: 8px 16px;
  margin: 16px 0 0;
  font-size: 14px;
  line-height: 1;
  font-weight: 500;
  transition: background 0.2s ease-in-out;
  cursor: pointer;

  &:hover {
    background: ${({ theme }) => theme.border2};
  }

  > a {
    display: flex;
    align-items: center;
    color: inherit;
    text-decoration: none;
  }
`

const CheckCircleCustom = styled(CheckCircle)`
  height: auto;
  width: 20px;
  max-height: 100%;
  margin: 0 10px 0 0;
`

const ConfirmedIcon = styled(ColumnCenter)`
  padding: 16px 0 32px;
`

const CowSVG = `<svg id="milk-bottle" width="99" height="95" viewBox="0 0 99 95" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M50.5601 9.84005C53.3737 10.021 56.1597 10.5038 58.8701 11.28C60.3205 8.54165 61.5349 5.68461 62.5001 2.74001C62.7961 1.88041 63.3714 1.14465 64.1342 0.650045C64.897 0.155444 65.8035 -0.0694773 66.709 0.0110676C67.6146 0.0916124 68.4671 0.473034 69.1306 1.0945C69.7942 1.71597 70.2305 2.54168 70.3701 3.44002C70.7043 5.60645 70.8382 7.79903 70.7702 9.99001C86.9002 6.64001 98.9101 3.82001 98.4801 9.93001L98.4201 10.15C94.8101 20.08 87.6101 28.02 78.6701 31.94C77.792 32.2439 77.0443 32.8393 76.5513 33.627C76.0583 34.4147 75.8496 35.3474 75.9601 36.27C76.0701 44.94 75.9601 53.38 75.9601 61.96C67.5172 58.2924 58.4103 56.3997 49.2052 56.3997C40 56.3997 30.8931 58.2924 22.4502 61.96C22.4502 53.38 22.3802 44.96 22.4502 36.27C22.5606 35.3474 22.352 34.4147 21.859 33.627C21.366 32.8393 20.6183 32.2439 19.7401 31.94C10.8001 28.02 3.60013 20.08 -0.00986631 10.15L-0.0698639 9.93001C-0.499864 3.82001 11.5102 6.64001 27.6402 9.99001C27.5721 7.79903 27.706 5.60645 28.0401 3.44002C28.1797 2.54168 28.6161 1.71597 29.2797 1.0945C29.9432 0.473034 30.7957 0.0916124 31.7013 0.0110676C32.6068 -0.0694773 33.5133 0.155444 34.2761 0.650045C35.0389 1.14465 35.6141 1.88041 35.9101 2.74001C36.8754 5.68461 38.0898 8.54165 39.5401 11.28C42.2506 10.5038 45.0365 10.021 47.8501 9.84005H50.5601Z" fill="#193151"/>
<path d="M49.49 12.8C53.1573 12.947 56.7844 13.6206 60.26 14.8C62.3878 11.3041 64.093 7.56795 65.34 3.66999C65.4034 3.43546 65.5499 3.23207 65.7524 3.09773C65.9548 2.96339 66.1993 2.9073 66.44 2.94001C66.6919 2.9392 66.9348 3.03355 67.1202 3.20411C67.3056 3.37468 67.4199 3.60888 67.44 3.86C67.8834 7.08213 67.9304 10.3465 67.58 13.58C69.5 13.29 69.98 13.22 72.52 12.65C88.7 9.09003 94 8.95001 95.45 9.56001C92.07 18.5 85.54 25.63 77.45 29.16C76.0342 29.6984 74.8311 30.6814 74.0215 31.9616C73.212 33.2418 72.8394 34.7501 72.96 36.26C73.05 43.46 72.96 50.51 72.96 57.59C57.635 51.8965 40.7749 51.8965 25.45 57.59C25.45 50.51 25.45 43.46 25.45 36.26C25.5705 34.7501 25.198 33.2418 24.3884 31.9616C23.5788 30.6814 22.3758 29.6984 20.96 29.16C12.9 25.63 6.36996 18.5 2.95996 9.56001C4.40996 8.95001 9.71001 9.09003 25.89 12.65C28.43 13.22 28.89 13.29 30.83 13.58C30.4796 10.3465 30.5266 7.08213 30.97 3.86C30.9901 3.60888 31.1043 3.37468 31.2897 3.20411C31.4751 3.03355 31.7181 2.9392 31.97 2.94001C32.2107 2.9073 32.4552 2.96339 32.6576 3.09773C32.86 3.23207 33.0066 3.43546 33.07 3.66999C34.3169 7.56795 36.0222 11.3041 38.15 14.8C41.6256 13.6206 45.2527 12.947 48.92 12.8H49.49Z" fill="#BFD5EB"/>
<path d="M35.82 40.39C34.4636 40.3742 33.168 39.825 32.2136 38.8612C31.2591 37.8974 30.7225 36.5964 30.72 35.24C30.7382 34.595 30.8836 33.96 31.1479 33.3714C31.4122 32.7828 31.7901 32.2522 32.26 31.81C33.2162 30.8969 34.4879 30.3882 35.81 30.39C37.8387 30.5261 39.8266 31.0239 41.68 31.86C43.75 32.76 45.48 34.01 45.47 35.39C45.46 36.77 43.73 38.01 41.66 38.91C39.8132 39.7365 37.8375 40.2372 35.82 40.39Z" fill="#FFD700"/>
<path d="M35.7699 41.75C34.0546 41.7237 32.4188 41.0224 31.217 39.7982C30.0153 38.574 29.3444 36.9255 29.3499 35.21C29.3752 34.3822 29.5651 33.5676 29.9085 32.8139C30.2519 32.0602 30.7419 31.3824 31.3499 30.82C32.5543 29.6645 34.1609 29.0226 35.8299 29.03C38.0409 29.1676 40.2089 29.7028 42.2299 30.61C45.2299 31.93 46.8499 33.61 46.8499 35.39C46.8499 37.17 45.2399 38.84 42.2099 40.16C40.1968 41.0612 38.0403 41.5994 35.8399 41.75H35.7799H35.7699ZM35.7699 31.75C34.7999 31.7496 33.8676 32.1261 33.1699 32.8C32.8278 33.1161 32.5525 33.4975 32.3601 33.9218C32.1678 34.346 32.0623 34.8044 32.0499 35.27C32.0484 35.7587 32.1439 36.2429 32.331 36.6943C32.5181 37.1458 32.7931 37.5557 33.1399 37.9C33.4838 38.253 33.8941 38.5346 34.3471 38.7285C34.8002 38.9224 35.2871 39.0249 35.7799 39.03C37.6109 38.8739 39.4026 38.4108 41.0799 37.66C43.2799 36.66 44.0799 35.78 44.0799 35.38C44.0799 34.98 43.2899 34.06 41.0799 33.11C39.3972 32.3563 37.5979 31.8963 35.7599 31.75H35.7699Z" fill="#193151"/>
<path d="M11.5999 14.25L24.0999 17.1501C24.2339 17.1793 24.3549 17.2507 24.4452 17.3538C24.5354 17.457 24.5902 17.5864 24.6014 17.723C24.6126 17.8597 24.5796 17.9962 24.5074 18.1127C24.4351 18.2292 24.3274 18.3194 24.2 18.37C21.71 19.37 17.2 20.87 15.07 19.27C11.98 16.97 11.02 15.69 10.83 14.99C10.8081 14.8855 10.8132 14.7772 10.8447 14.6752C10.8762 14.5732 10.9331 14.4808 11.0101 14.4068C11.0871 14.3328 11.1816 14.2797 11.2848 14.2522C11.3879 14.2248 11.4964 14.224 11.5999 14.25Z" fill="#193151"/>
<path d="M62.67 40.39C64.028 40.3795 65.3267 39.8319 66.2823 38.8669C67.2379 37.902 67.7727 36.598 67.7701 35.24C67.7518 34.595 67.6064 33.96 67.3421 33.3714C67.0778 32.7828 66.6999 32.2522 66.23 31.81C65.2739 30.8969 64.0021 30.3882 62.68 30.39C60.6514 30.5261 58.6634 31.0239 56.81 31.86C54.74 32.76 53.0101 34.01 53.0201 35.39C53.0301 36.77 54.7601 38.01 56.8301 38.91C58.6768 39.7365 60.6526 40.2372 62.67 40.39Z" fill="#FFD700"/>
<path d="M62.7201 41.75C64.4354 41.7237 66.0712 41.0224 67.2729 39.7982C68.4747 38.574 69.1456 36.9255 69.1401 35.21C69.1148 34.3822 68.9249 33.5676 68.5815 32.8139C68.2381 32.0602 67.7482 31.3824 67.1401 30.82C65.9357 29.6645 64.3292 29.0226 62.6601 29.03C60.4491 29.1676 58.2811 29.7028 56.2601 30.61C53.2601 31.93 51.6401 33.61 51.6401 35.39C51.6401 37.17 53.2501 38.84 56.2801 40.16C58.2932 41.0612 60.4497 41.5994 62.6501 41.75H62.7101H62.7201ZM62.7201 31.75C63.6901 31.7496 64.6224 32.1261 65.3201 32.8C65.6622 33.1161 65.9375 33.4975 66.1298 33.9218C66.3222 34.346 66.4277 34.8044 66.4401 35.27C66.4417 35.7587 66.3461 36.2429 66.1589 36.6943C65.9718 37.1458 65.6969 37.5557 65.3501 37.9C65.0062 38.253 64.5959 38.5346 64.1429 38.7285C63.6898 38.9224 63.2029 39.0249 62.7101 39.03C60.8791 38.8739 59.0874 38.4108 57.4101 37.66C55.2101 36.66 54.4101 35.78 54.4101 35.38C54.4101 34.98 55.2001 34.06 57.4101 33.11C59.0928 32.3563 60.8921 31.8963 62.7301 31.75H62.7201Z" fill="#193151"/>
<path d="M86.89 14.25L74.39 17.1501C74.2561 17.1793 74.1351 17.2507 74.0448 17.3538C73.9545 17.457 73.8998 17.5864 73.8886 17.723C73.8774 17.8597 73.9103 17.9962 73.9826 18.1127C74.0549 18.2292 74.1626 18.3194 74.29 18.37C76.78 19.37 81.29 20.87 83.42 19.27C86.51 16.97 87.47 15.69 87.66 14.99C87.6818 14.8855 87.6768 14.7772 87.6453 14.6752C87.6138 14.5732 87.5568 14.4808 87.4799 14.4068C87.4029 14.3328 87.3084 14.2797 87.2052 14.2522C87.102 14.2248 86.9936 14.224 86.89 14.25Z" fill="#193151"/>
<path d="M78.7099 63.95C73.5799 58.41 66.8599 55.95 59.7099 54.49C56.3585 53.7515 52.931 53.4158 49.5 53.49H49.01C45.579 53.4158 42.1514 53.7515 38.8 54.49C31.64 55.91 24.92 58.41 19.8 63.95C15.65 68.45 14.48 74.06 17.11 78.75C18.8048 82.0134 21.3296 84.7727 24.43 86.75C30.2576 90.106 36.736 92.1757 43.43 92.82C45.2781 93.0402 47.1389 93.1371 49 93.11H49.49C51.351 93.1371 53.2118 93.0402 55.06 92.82C61.7539 92.1757 68.2323 90.106 74.06 86.75C77.1604 84.7727 79.6851 82.0134 81.38 78.75C84.03 74.06 82.8599 68.45 78.7099 63.95Z" fill="#9AB6CC"/>
<path d="M75.8699 63.32C71.2599 59.12 65.2299 57.23 58.7999 56.16C55.7338 55.5599 52.6139 55.2783 49.4899 55.32H49.0399C45.9106 55.2638 42.7839 55.5319 39.7099 56.12C33.2799 57.19 27.2499 59.12 22.6399 63.28C18.9099 66.68 17.8699 70.93 20.2199 74.48C21.8387 77.0514 24.1088 79.149 26.7999 80.56C32.1601 83.1355 37.9513 84.6953 43.8799 85.16C45.6478 85.3325 47.4239 85.4059 49.1999 85.38H49.3299C51.106 85.4059 52.882 85.3325 54.6499 85.16C60.5786 84.6953 66.3697 83.1355 71.7299 80.56C74.421 79.149 76.6911 77.0514 78.3099 74.48C80.6399 70.92 79.5999 66.67 75.8699 63.32Z" fill="#BFD5EB"/>
<path d="M36.23 75.15C33.32 76.57 30.61 75.15 30.09 71.93C29.52 68.48 34.17 60.28 35.24 66.48C36.31 72.68 41.07 64.01 41.1 67.89C41.0219 69.4278 40.5276 70.9154 39.6699 72.1941C38.8121 73.4728 37.6232 74.4945 36.23 75.15Z" fill="#193151"/>
<path d="M79.9099 62.84C73.7999 56.24 65.63 53.99 60.02 52.84H59.89C56.9541 52.1888 53.9571 51.8536 50.95 51.84H47.5399C44.5328 51.8536 41.5357 52.1888 38.5999 52.84H38.4699C32.8599 53.95 24.69 56.2 18.58 62.84C13.86 67.94 12.7499 74.35 15.6599 79.55C17.4815 83.082 20.212 86.0645 23.5699 88.19C29.1199 91.53 35.3699 93.53 43.2299 94.48C44.9851 94.6942 46.7518 94.8011 48.52 94.8H49.9699C51.7381 94.8011 53.5048 94.6942 55.2599 94.48C63.1199 93.53 69.3699 91.53 74.9199 88.19C78.2778 86.0645 81.0083 83.082 82.83 79.55C85.74 74.32 84.6299 67.94 79.9099 62.84ZM79.9699 77.95C78.4206 80.9797 76.0947 83.5436 73.2299 85.38C68.0899 88.47 62.2299 90.38 54.8599 91.23C53.0781 91.4424 51.2842 91.5359 49.4899 91.51H48.9999C47.2057 91.5359 45.4117 91.4424 43.6299 91.23C36.2399 90.33 30.4 88.47 25.2599 85.38C22.3952 83.5436 20.0693 80.9797 18.52 77.95C16.29 73.95 17.2099 69.15 20.9899 65.07C25.1999 60.51 30.7899 57.74 39.1099 56.07H39.2299C42.511 55.3363 45.8685 55.0005 49.2299 55.07H49.3599C52.7046 55.0046 56.0451 55.3403 59.3099 56.07H59.4299C67.7499 57.71 73.3399 60.48 77.5499 65.07C81.2799 69.15 82.1999 73.97 79.9699 77.95Z" fill="#193151"/>
<path d="M62.2601 75.15C65.1701 76.57 67.8801 75.15 68.4001 71.93C68.9701 68.48 64.3201 60.28 63.2501 66.48C62.1801 72.68 57.4201 64.01 57.3901 67.89C57.4682 69.4278 57.9625 70.9154 58.8203 72.1941C59.678 73.4728 60.8669 74.4945 62.2601 75.15Z" fill="#193151"/>
</svg>
`

const CowSVGback = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="94" fill="none">
<path fill="#254F83" d="M71.75 9.995a35.699 35.699 0 00-.4-6.55 4.07 4.07 0 00-7.87-.7 54.56 54.56 0 01-3.63 8.54 39.366 39.366 0 00-8.31-1.44h-2.63c-2.814.181-5.6.664-8.31 1.44a54.55 54.55 0 01-3.63-8.54 4.07 4.07 0 00-7.87.7 35.699 35.699 0 00-.4 6.55C12.57 6.645.56 3.825.99 9.935l.06.22c3.61 9.93 10.81 17.87 19.75 21.79a4.07 4.07 0 012.67 4.38c-.09 7.23 0 14.3 0 21.41a41.632 41.632 0 0115.72-6.13h.11a44.126 44.126 0 017.68-1v-.08h6.49v.07c2.585.102 5.155.437 7.68 1h.11a41.63 41.63 0 0115.72 6.13c0-7.11.05-14.18 0-21.41a4.07 4.07 0 012.71-4.33c8.94-3.92 16.14-11.86 19.75-21.79l.06-.22c.39-6.15-11.62-3.33-27.75.02z"/>
<path fill="#254F83" d="M60.68 54.495a43.109 43.109 0 00-10.21-1.05h-.49a43.108 43.108 0 00-10.21 1.05c-7.16 1.42-13.88 3.92-19 9.46-4.15 4.5-5.32 10.11-2.69 14.8a20.93 20.93 0 007.32 8 47.12 47.12 0 0019 6.07c1.696.2 3.402.297 5.11.29h.48l.05.54v.11-.65h.86c1.707.007 3.414-.09 5.11-.29a47.12 47.12 0 0019-6.07 20.93 20.93 0 007.32-8c2.63-4.69 1.46-10.3-2.69-14.8-5.08-5.54-11.8-8.04-18.96-9.46z"/>
</svg>
`

const UserSignIcon = `<svg width="24" height="16" viewBox="0 0 24 16" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M11 6V8H9V10H7V8H5.8C5.4 9.2 4.3 10 3 10C1.3 10 0 8.7 0 7C0 5.3 1.3 4 3 4C4.3 4 5.4 4.8 5.8 6H11ZM3 6C2.4 6 2 6.4 2 7C2 7.6 2.4 8 3 8C3.6 8 4 7.6 4 7C4 6.4 3.6 6 3 6ZM16 10C18.7 10 24 11.3 24 14V16H8V14C8 11.3 13.3 10 16 10ZM16 8C13.8 8 12 6.2 12 4C12 1.8 13.8 0 16 0C18.2 0 20 1.8 20 4C20 6.2 18.2 8 16 8Z" fill="black"/>
</svg>
`

const UpperSection = styled.div`
  display: flex;
  flex-flow: column wrap;
  padding: 16px 0;
`

const LowerSection = styled.div`
  display: flex;
  flex-flow: column wrap;
  background: ${({ theme }) => theme.bg4};
  padding: 16px;
  margin: 16px auto 0;

  > h3 {
    text-align: center;
    width: 100%;
    font-size: 21px;
  }
`

const StepsWrapper = styled.div`
  display: flex;
  flex-flow: row wrap;

  > div {
    flex: 1 1 50%;
    display: flex;
    flex-flow: column wrap;
  }

  > div > p {
    font-size: 13px;
    text-align: center;
  }
`

const StepsIconWraper = styled.div`
  border-radius: 75px;
  height: 75px;
  width: 75px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid ${({ theme }) => theme.border};

  > svg {
    height: 100%;
    width: 100%;
    padding: 20px;
  }

  > svg > path {
    fill: ${({ theme }) => theme.bg2};
  }
`

export * from './TransactionConfirmationModalMod'
export { default } from './TransactionConfirmationModalMod'

export function ConfirmationPendingContent({
  onDismiss,
  pendingText,
}: {
  onDismiss: () => void
  pendingText: ReactNode
}) {
  return (
    <Wrapper>
      <UpperSection>
        <CloseIconWrapper onClick={onDismiss} />

        <div className="ud-loader--flip wrapper">
          <div className="ud-loader--flip__content">
            <div className="ud-loader--flip__side">
              <SVG src={CowSVG} description="Loading" />
            </div>
            <div className="back ud-loader--flip__side ud-loader--flip__side--back">
              <SVG src={CowSVGback} description="LoadingBack" />
            </div>
          </div>
        </div>

        <Text fontWeight={500} fontSize={16} color="" textAlign="center">
          {pendingText}
        </Text>
      </UpperSection>

      <LowerSection>
        <h3>
          <Trans>Almost there!</Trans>
        </h3>

        <StepsWrapper>
          <div>
            <StepsIconWraper>
              <SVG src={UserSignIcon} />
            </StepsIconWraper>
            <p>
              <Trans>Sign and submit the order with your [wallet | Gnosis Safe | smart contract wallet].</Trans>
            </p>
          </div>
          <div>
            <StepsIconWraper>
              <SVG src={UserSignIcon} />
            </StepsIconWraper>
            <p>
              <Trans>The order is then submitted and ready to be settled.</Trans>
            </p>
          </div>
        </StepsWrapper>
      </LowerSection>
    </Wrapper>
  )
}

export function TransactionSubmittedContent({
  onDismiss,
  chainId,
  hash,
  currencyToAdd,
}: {
  onDismiss: () => void
  hash: string | undefined
  chainId: ChainId
  currencyToAdd?: Currency | undefined
}) {
  const theme = useContext(ThemeContext)
  const { library } = useActiveWeb3React()
  const { addToken, success } = useAddTokenToMetamask(currencyToAdd)

  return (
    <Wrapper>
      <Section>
        <CloseIconWrapper onClick={onDismiss} />

        <ConfirmedIcon>
          <ArrowUpCircle strokeWidth={0.5} size={90} color={theme.primary1} />
        </ConfirmedIcon>

        <Text fontWeight={500} fontSize={20}>
          Transaction Submitted
        </Text>

        {chainId && hash && (
          <ExternalLinkCustom href={getEtherscanLink(chainId, hash, 'transaction')}>
            <Text fontWeight={500} fontSize={14} color={theme.primary1}>
              {getExplorerLabel(chainId, hash, 'transaction')} ↗
            </Text>
          </ExternalLinkCustom>
        )}

        <ButtonGroup>
          {currencyToAdd && library?.provider?.isMetaMask && (
            <ButtonCustom onClick={addToken}>
              {!success ? (
                <RowFixed>
                  <StyledIcon src={MetaMaskLogo} /> Add {currencyToAdd.symbol} to Metamask
                </RowFixed>
              ) : (
                <RowFixed>
                  <CheckCircleCustom size={'16px'} stroke={theme.green1} />
                  Added {currencyToAdd.symbol}{' '}
                </RowFixed>
              )}
            </ButtonCustom>
          )}

          <ButtonCustom>
            <InternalLink to="/play" onClick={onDismiss}>
              <StyledIcon src={GameIcon} alt="Play CowGame" />
              Play the CowGame!
            </InternalLink>
          </ButtonCustom>
        </ButtonGroup>

        <CloseLink onClick={onDismiss}>Close</CloseLink>
      </Section>
    </Wrapper>
  )
}

export interface ConfirmationModalContentProps {
  title: ReactNode
  onDismiss: () => void
  topContent: () => ReactNode
  bottomContent?: () => ReactNode | undefined
}

export function ConfirmationModalContent(props: ConfirmationModalContentProps) {
  return <ConfirmationModalContentMod {...props} />
}
