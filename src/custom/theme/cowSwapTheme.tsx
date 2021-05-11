import { DefaultTheme, ThemeProvider as StyledComponentsThemeProvider, createGlobalStyle, css } from 'styled-components'
import React, { useMemo } from 'react'
import Cursor1 from 'assets/cow-swap/cursor1.gif'
import Cursor2 from 'assets/cow-swap/cursor2.gif'
import Cursor3 from 'assets/cow-swap/cursor3.gif'
import Cursor4 from 'assets/cow-swap/cursor4.gif'

import { Colors } from 'theme/styled'
import { colors as colorsBaseTheme, themeVariables as baseThemeVariables } from 'theme/baseTheme'

import {
  theme as themeUniswap,
  FixedGlobalStyle as FixedGlobalStyleUniswap,
  ThemedGlobalStyle as ThemedGlobalStyleUniswap
} from '@src/theme'
import { useIsDarkMode } from 'state/user/hooks'
import { cowSwapBackground, cowSwapLogo } from './cowSwapAssets'

export { TYPE } from '@src/theme'
export * from '@src/theme/components'

export function colors(darkMode: boolean): Colors {
  return {
    ...colorsBaseTheme(darkMode),

    // ****** base ******
    white: darkMode ? '#A5C0DB' : '#ffffff',
    black: darkMode ? '#021E34' : '#000000',

    // ****** text ******
    text1: darkMode ? '#A5C0DB' : '#000000',
    text2: darkMode ? '#000000' : '#000000',
    text3: darkMode ? '#000000' : '#000000',
    text4: darkMode ? '#000000b8' : '#000000b8',

    // ****** backgrounds / greys ******
    bg1: darkMode ? '#163861' : '#D5E9F0',
    bg2: darkMode ? '#A5C0DB' : '#ffffff',
    bg3: darkMode ? '#163861' : '#d5e8f0',
    bg4: darkMode ? '#163861' : '#ffffff',

    // ****** specialty colors ******
    advancedBG: darkMode ? '#163861' : '#d5e8f0',

    // ****** primary colors ******
    primary1: darkMode ? '#e47651' : '#FF784A',
    primary4: darkMode ? '#ff5d25' : '#ff5d25',
    primary5: darkMode ? '#e47651' : '#FF784A',

    // ****** color text ******
    primaryText1: darkMode ? '#021E34' : '#000000',

    // ****** secondary colors ******
    secondary1: darkMode ? '#2172E5' : '#8958FF',
    secondary3: darkMode ? '#17000b26' : 'rgba(137,88,255,0.6)',

    // ****** other ******
    border: darkMode ? '#021E34' : '#000000',
    disabled: darkMode ? '#A5C0DB' : '#afcbda'
  }
}

function themeVariables(darkMode: boolean, colorsTheme: Colors) {
  return {
    logo: {
      src: `data:image/svg+xml;base64,${cowSwapLogo(darkMode)}`,
      alt: 'CowSwap Logo',
      width: '208px',
      height: '50px'
    },
    cursor: css`
      cursor: url(${Cursor1}), auto;
      animation: cursor 1s infinite;
      @keyframes cursor {
        0% {
          cursor: url(${Cursor1}), auto;
        }
        25% {
          cursor: url(${Cursor2}), auto;
        }
        50% {
          cursor: url(${Cursor3}), auto;
        }
        75% {
          cursor: url(${Cursor4}), auto;
        }
      }
    `,
    body: {
      background: css`
        background: rgba(164, 211, 227, 1);
        transition: background-color 2s ease-in-out, background-image 2s ease-in-out;
        background: url(data:image/svg+xml;base64,${cowSwapBackground(darkMode)}) no-repeat 100% / cover fixed,
          ${
            darkMode
              ? 'linear-gradient(180deg,rgba(20, 45, 78, 1) 10%, rgba(22, 58, 100, 1) 30%)'
              : 'linear-gradient(180deg,rgba(164, 211, 227, 1) 5%, rgba(255, 255, 255, 1) 40%)'
          };
        background-attachment: fixed;
      `
    },
    appBody: {
      boxShadow: `6px 6px 0px ${colorsTheme.black}`,
      borderRadius: '8px',
      border: `4px solid ${colorsTheme.black}`,
      padding: '12px 6px',
      maxWidth: {
        normal: '420px',
        content: '620px'
      }
    },
    header: {
      border: 'none'
    },
    swap: {
      headerSize: '28px'
    },
    buttonPrimary: {
      background: css`
        background: ${colorsTheme.primary1};
        color: ${colorsTheme.text1};
      `,
      fontWeight: '800',
      border: `4px solid ${colorsTheme.black}`,
      borderRadius: '9px',
      boxShadow: `4px 4px 0px ${colorsTheme.black}`
    },
    buttonOutlined: {
      background: css`
        background: ${colorsTheme.bg1};
        color: ${colorsTheme.text1};
      `,
      fontWeight: '800',
      border: `4px solid ${colorsTheme.black}`,
      borderRadius: '9px',
      boxShadow: `4px 4px 0px ${colorsTheme.black}`
    },
    buttonLight: {
      backgroundHover: `${colorsTheme.primary4}`,
      fontWeight: '800',
      border: `4px solid ${colorsTheme.black}`,
      boxShadow: `4px 4px 0px ${colorsTheme.black}`
    },
    currencyInput: {
      background: `${colorsTheme.white}`,
      color: `${colorsTheme.text1}`,
      border: `4px solid ${colorsTheme.black}`
    },
    buttonCurrencySelect: {
      background: `${colorsTheme.bg1}`,
      border: `2px solid ${colorsTheme.black}`,
      boxShadow: `2px 2px 0px ${colorsTheme.black}`,
      color: `${colorsTheme.text1}`,
      colorSelected: `${colorsTheme.black}`
    },
    bgLinearGradient: css`
      background-image: linear-gradient(270deg, ${colorsTheme.purple} 30%, ${colorsTheme.blue1} 70%);
    `,
    version: colorsTheme.primary1,
    networkCard: {
      background: 'rgb(255 120 74 / 60%)',
      text: colorsTheme.text1
    }
  }
}

export function theme(darkmode: boolean): DefaultTheme {
  const colorsTheme = colors(darkmode)
  return {
    ...themeUniswap(darkmode),
    ...colorsTheme,

    // Overide Theme
    ...baseThemeVariables(darkmode, colorsTheme),
    ...themeVariables(darkmode, colorsTheme)
  }
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const darkMode = useIsDarkMode()

  const themeObject = useMemo(() => theme(darkMode), [darkMode])

  return <StyledComponentsThemeProvider theme={themeObject}>{children}</StyledComponentsThemeProvider>
}

export const FixedGlobalStyle = createGlobalStyle`
  // Uniswap default
  ${FixedGlobalStyleUniswap}
`

export const ThemedGlobalStyle = createGlobalStyle`
  // Uniswap default
  ${ThemedGlobalStyleUniswap}

  // Custom
  html {
    color: ${({ theme }) => theme.text1};
    ${({ theme }) => theme.body.background}
  }
  body {
    background-position: initial;
    background-repeat: no-repeat;
    background-image: initial;
  }

  ::selection { 
    background: ${({ theme }) => theme.primary1};
    color: ${({ theme }) => theme.text1};
  }
`
