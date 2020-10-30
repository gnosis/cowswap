// import { darken } from 'polished' 
import styled from 'styled-components'

import { 
ButtonPrimary as ButtonPrimaryMod, 
ButtonLight as ButtonLightMod,
ButtonGray as ButtonGrayMod,
ButtonSecondary as ButtonSecondaryMod,
ButtonPink as ButtonPinkMod,
ButtonOutlined as ButtonOutlinedMod,
ButtonEmpty as ButtonEmptyMod,
ButtonWhite as ButtonWhiteMod, 
ButtonConfirmed as ButtonConfirmedMod,
ButtonError as ButtonErrorMod,
ButtonDropdown as ButtonDropdownMod,
ButtonDropdownLight as ButtonDropdownLightMod,
ButtonRadio as ButtonRadioMod
 } from './ButtonMod'


const ButtonPrimary = styled (ButtonPrimaryMod)`
    // CSS overrides
    &:focus,
    &:hover,
    &:active {
        background-color:transparent; 
        background-image: ${({ theme }) => `linear-gradient(270deg, ${theme.purple} 0%, ${theme.blue1} 100%);`}
    }
`

const ButtonLight = styled (ButtonLightMod)`
    // CSS overrides
    &:focus,
    &:hover,
    &:active {
        background-color:transparent; 
        background-image: ${({ theme }) => `linear-gradient(270deg, ${theme.purple} 0%, ${theme.blue1} 100%);`}
    }
`

const ButtonGray = styled (ButtonGrayMod)`
    // CSS overrides
    background-color:transparent; 
    background-image: ${({ theme }) => `linear-gradient(270deg, ${theme.purple} 0%, ${theme.blue1} 100%);`}
`

const ButtonSecondary = styled (ButtonSecondaryMod)`
    // CSS overrides
    &:focus,
    &:hover,
    &:active {
        background-color:transparent; 
        background-image: ${({ theme }) => `linear-gradient(270deg, ${theme.purple} 0%, ${theme.blue1} 100%);`}
    }
`

const ButtonPink = styled (ButtonPinkMod)`
    // CSS overrides
    &:focus,
    &:hover,
    &:active {
        background-color:transparent; 
        background-image: ${({ theme }) => `linear-gradient(270deg, ${theme.purple} 0%, ${theme.blue1} 100%);`}
    }
`

const ButtonOutlined = styled (ButtonOutlinedMod)`
    // CSS overrides
`

const ButtonWhite = styled (ButtonWhiteMod)`
    // CSS overrides
    &:focus,
    &:hover,
    &:active {
        background-color:transparent; 
        background-image: ${({ theme }) => `linear-gradient(270deg, ${theme.purple} 0%, ${theme.blue1} 100%);`}
    }
`

const ButtonEmpty = styled (ButtonEmptyMod)`
    // CSS overrides
`

const ButtonConfirmed = styled (ButtonConfirmedMod)`
    // CSS overrides
    &:focus,
    &:hover,
    &:active {
        background-color:transparent; 
        background-image: ${({ theme }) => `linear-gradient(270deg, ${theme.purple} 0%, ${theme.blue1} 100%);`}
    }
`

const ButtonError = styled (ButtonErrorMod)`
    // CSS overrides
`

const ButtonDropdown = styled (ButtonDropdownMod)`
    // CSS overrides
`

const ButtonDropdownLight = styled (ButtonDropdownLightMod)`
    // CSS overrides
`

const ButtonRadio = styled (ButtonRadioMod)`
    // CSS overrides
`

export {
    ButtonWhite,
    ButtonEmpty,
    ButtonConfirmed,
    ButtonError,
    ButtonDropdown,
    ButtonDropdownLight,
    ButtonRadio,
    ButtonPrimary,
    ButtonLight,
    ButtonGray,
    ButtonSecondary,
    ButtonPink,
    ButtonOutlined
}