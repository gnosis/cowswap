import React from 'react'
import styled from 'styled-components'
import ManageMod, { ToggleWrapper } from './ManageMod'
import { Token } from '@uniswap/sdk'
import { TokenList } from '@uniswap/token-lists'
import { CurrencyModalView } from '@src/components/SearchModal/CurrencySearchModal'

const Wrapper = styled.div`
  width: 100%;

  ${ToggleWrapper} {
    background-color: ${({ theme }) => theme.bg4};
  }
`

export const ToggleOption = styled.div<{ active?: boolean }>`
  width: 48%;
  padding: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  font-weight: 600;
  background-color: ${({ theme, active }) => (active ? theme.bg1 : theme.bg4)};
  color: ${({ theme, active }) => (active ? theme.text1 : theme.disabled)};
  user-select: none;

  :hover {
    cursor: pointer;
    opacity: 0.9;
  }
`

export default function Manage(props: {
  onDismiss: () => void
  setModalView: (view: CurrencyModalView) => void
  setImportToken: (token: Token) => void
  setImportList: (list: TokenList) => void
  setListUrl: (url: string) => void
}) {
  return (
    <Wrapper>
      <ManageMod {...props} />
    </Wrapper>
  )
}
