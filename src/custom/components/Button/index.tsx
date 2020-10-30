import React from 'react'
import styled from 'styled-components'
import { ButtonProps } from 'rebass/styled-components'
import { ChevronDown } from 'react-feather'

import { RowBetween } from 'components/Row'

import {
  // Import only the basic buttons
  ButtonPrimary as ButtonPrimaryMod,
  ButtonLight as ButtonLightMod,
  ButtonGray as ButtonGrayMod,
  ButtonSecondary as ButtonSecondaryMod,
  ButtonPink as ButtonPinkMod,
  ButtonOutlined as ButtonOutlinedMod,
  ButtonEmpty as ButtonEmptyMod,
  ButtonWhite as ButtonWhiteMod,
  ButtonConfirmedStyle as ButtonConfirmedStyleMod,
  ButtonErrorStyle as ButtonErrorStyleMod
  // We don't import the "composite" buttons, they are just redefined (c&p actually)
} from './ButtonMod'

export const ButtonPrimary = styled(ButtonPrimaryMod)`
  // CSS overrides
  &:focus,
  &:hover,
  &:active {
    background-color: transparent;
    background-image: ${({ theme }) => `linear-gradient(270deg, ${theme.purple} 0%, ${theme.blue1} 100%);`};
  }
`

export const ButtonLight = styled(ButtonLightMod)`
  // CSS overrides
  &:focus,
  &:hover,
  &:active {
    background-color: transparent;
    background-image: ${({ theme }) => `linear-gradient(270deg, ${theme.purple} 0%, ${theme.blue1} 100%);`};
  }
`

export const ButtonGray = styled(ButtonGrayMod)`
  // CSS overrides
  background-color: transparent;
  background-image: ${({ theme }) => `linear-gradient(270deg, ${theme.purple} 0%, ${theme.blue1} 100%);`};
`

export const ButtonSecondary = styled(ButtonSecondaryMod)`
  // CSS overrides
  &:focus,
  &:hover,
  &:active {
    background-color: transparent;
    background-image: ${({ theme }) => `linear-gradient(270deg, ${theme.purple} 0%, ${theme.blue1} 100%);`};
  }
`

export const ButtonPink = styled(ButtonPinkMod)`
  // CSS overrides
  &:focus,
  &:hover,
  &:active {
    background-color: transparent;
    background-image: ${({ theme }) => `linear-gradient(270deg, ${theme.purple} 0%, ${theme.blue1} 100%);`};
  }
`

export const ButtonOutlined = styled(ButtonOutlinedMod)`
  // CSS overrides
`

export const ButtonWhite = styled(ButtonWhiteMod)`
  // CSS overrides
`

export const ButtonConfirmedStyle = styled(ButtonConfirmedStyleMod)`
  // CSS overrides
`

export const ButtonErrorStyle = styled(ButtonErrorStyleMod)`
  // CSS overrides
`

export const ButtonEmpty = styled(ButtonEmptyMod)`
  // CSS overrides
`

export function ButtonConfirmed({
  confirmed,
  altDisabledStyle,
  ...rest
}: { confirmed?: boolean; altDisabledStyle?: boolean } & ButtonProps) {
  if (confirmed) {
    return <ButtonConfirmedStyle {...rest} />
  } else {
    return <ButtonPrimary {...rest} altDisabledStyle={altDisabledStyle} />
  }
}

export function ButtonError({ error, ...rest }: { error?: boolean } & ButtonProps) {
  if (error) {
    return <ButtonErrorStyle {...rest} />
  } else {
    return <ButtonPrimary {...rest} />
  }
}

export function ButtonDropdown({ disabled = false, children, ...rest }: { disabled?: boolean } & ButtonProps) {
  return (
    <ButtonPrimary {...rest} disabled={disabled}>
      <RowBetween>
        <div style={{ display: 'flex', alignItems: 'center' }}>{children}</div>
        <ChevronDown size={24} />
      </RowBetween>
    </ButtonPrimary>
  )
}

export function ButtonDropdownLight({ disabled = false, children, ...rest }: { disabled?: boolean } & ButtonProps) {
  return (
    <ButtonOutlined {...rest} disabled={disabled}>
      <RowBetween>
        <div style={{ display: 'flex', alignItems: 'center' }}>{children}</div>
        <ChevronDown size={24} />
      </RowBetween>
    </ButtonOutlined>
  )
}

export function ButtonRadio({ active, ...rest }: { active?: boolean } & ButtonProps) {
  if (!active) {
    return <ButtonWhite {...rest} />
  } else {
    return <ButtonPrimary {...rest} />
  }
}
