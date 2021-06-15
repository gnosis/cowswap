import React from 'react'
import styled from 'styled-components'
import OptionMod, { InfoCard, OptionCardClickable, SubHeader } from './OptionMod'

const Wrapper = styled.div<{ clickable?: boolean; active?: boolean }>`
  ${InfoCard} {
    background-color: ${({ theme, active }) => (active ? theme.bg3 : theme.bg2)};
    &:focus {
      box-shadow: 0 0 0 1px ${({ theme }) => theme.primary1};
    }
    border-color: ${({ theme, active }) => (active ? 'transparent' : theme.bg3)};

    background: red;
  }

  ${OptionCardClickable} {
    &:hover {
      border: ${({ clickable, theme }) => (clickable ? `1px solid ${theme.primary1}` : ``)};
    }
    background: red;
  }

  ${SubHeader} {
    color: ${({ theme }) => theme.text2};
    background: red;
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
