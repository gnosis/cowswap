// Modified only for adding a better label for the Etherscan link
//  getExplorerLabel(chainId, hash, 'transaction')
import styled from 'styled-components'
import { Section } from './TransactionConfirmationModalMod'

export const BottomSection = styled(Section)`
  background-color: ${({ theme }) => theme.bg4};
  color: ${({ theme }) => theme.text1};
  border-bottom-left-radius: 20px;
  border-bottom-right-radius: 20px;
`

export * from './TransactionConfirmationModalMod'
export { default } from './TransactionConfirmationModalMod'
