import AppBodyMod from './AppBodyMod'
import styled from 'styled-components'

export const AppBody = styled(AppBodyMod)`
  background: ${({ theme }) => theme.bg3};
`

export default AppBody