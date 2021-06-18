import React from 'react'
import styled from 'styled-components'
import OptionMod, { InfoCard, OptionCardClickable, HeaderText, SubHeader } from './OptionMod'

const Wrapper = styled.div<{ clickable?: boolean; active?: boolean }>`
  ${InfoCard} {
    background-color: ${({ theme, active }) => (active ? theme.bg3 : theme.bg2)};
    color: ${({ theme }) => theme.text1};

    &:focus {
      box-shadow: 0 0 0 1px ${({ theme }) => theme.primary1};
    }

    border-color: ${({ theme, active }) => (active ? 'transparent' : theme.bg3)};
  }

  ${OptionCardClickable} {
    background-color: ${({ theme, active }) => (active ? theme.bg2 : theme.bg2)};
    color: ${({ theme, active }) => (active ? theme.text1 : theme.text2)};

    &:hover {
      border: ${({ clickable, theme }) => (clickable ? `1px solid ${theme.primary1}` : ``)};
    }
  }

  ${HeaderText},
  ${SubHeader} {
    color: ${({ theme }) => theme.text2};
  }
`

export default function Option(props: {
  link?: string | null
  clickable?: boolean
  size?: number | null
  onClick?: null | (() => void)
  color: string
  header: React.ReactNode
  subheader: React.ReactNode | null
  icon: string
  active?: boolean
  id: string
}) {
  return (
    <Wrapper>
      <OptionMod {...props} />
    </Wrapper>
  )
}
