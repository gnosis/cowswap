import HeaderMod, { UniIcon, HeaderFrame } from './HeaderMod'
import styled from 'styled-components'

export const Header = styled(HeaderMod)`
  // CSS Override

  ${UniIcon} {
    display: flex;
  }

  ${HeaderFrame} {
    border-bottom: 1px solid #3A3B5A;
  }
`

export default Header
