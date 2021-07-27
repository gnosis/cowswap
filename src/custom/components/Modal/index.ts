import styled from 'styled-components'
import Modal from '@src/components/Modal'

export * from '@src/components/Modal'
export { default } from '@src/components/Modal'

export const GpModal = styled(Modal)`
  > [data-reach-dialog-content] {
    background-color: ${({ theme }) => theme.bg1};

    .bottom-close-button {
      display: none;
      margin: auto auto 8px;

      ${({ theme }) => theme.mediaWidth.upToExtraSmall`
      display: flex;
    `}
    }

    ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    max-height: 100vh;
    height: 100vh;
    max-width: 100vw;
    width:  100vw;
    border-radius: 0px;
  `}
  }
`
