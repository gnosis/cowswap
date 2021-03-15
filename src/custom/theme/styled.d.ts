import { Colors as ColorsUniswap } from '@src/theme/styled'
export { Color, Grids } from '@src/theme/styled'

// Override colors
export interface Colors extends ColorsUniswap {
  purple: Color
  border: Color
  disabled: Color
}

declare module 'styled-components' {
  // Copy of DefaultTheme in '../../theme/styled'
  export interface DefaultThemeUniswap extends ColorsUniswap {
    grids: Grids

    // shadows
    shadow1: string

    // media queries
    mediaWidth: {
      upToExtraSmall: ThemedCssFunction<DefaultTheme>
      upToSmall: ThemedCssFunction<DefaultTheme>
      upToMedium: ThemedCssFunction<DefaultTheme>
      upToLarge: ThemedCssFunction<DefaultTheme>
    }

    // css snippets
    flexColumnNoWrap: FlattenSimpleInterpolation
    flexRowNoWrap: FlattenSimpleInterpolation
  }

  // Override theme
  export interface DefaultTheme extends DefaultThemeUniswap, Colors {
    // css snippets
    body: {
      background: FlattenSimpleInterpolation
      backgroundRepeat?: FlattenSimpleInterpolation
      backgroundPosition?: FlattenSimpleInterpolation
    }
    appBody: {
      maxWidth: string
      boxShadow: string
      borderRadius: string
      border: string
      padding: string
    }
    buttonLight: {
      fontSize: string
      fontWeight: string
      border: string
      borderRadius: string
      boxShadow: string
    }
    bgLinearGradient: FlattenSimpleInterpolation
  }
}
