import React from 'react'
import { Code, MessageCircle } from 'react-feather'

import MenuMod, { MenuItem, InternalMenuItem, MenuFlyout as MenuFlyoutUni } from './MenuMod'
import styled from 'styled-components'

const CODE_LINK = 'https://github.com/gnosis/gp-swap-ui'
const DISCORD_LINK = 'https://discord.gg/egGzDDctuC'

export const StyledMenu = styled(MenuMod)`
  hr {
    margin: 15px 0;
  }
`

const Policy = styled(InternalMenuItem)`
  font-size: 0.8em;
  text-decoration: underline;
`

const MenuFlyout = styled(MenuFlyoutUni)`
  min-width: 11rem;
`

export function Menu() {
  return (
    <StyledMenu>
      <MenuFlyout>
        <InternalMenuItem to="/faq">
          <Code size={14} />
          FAQ
        </InternalMenuItem>

        <MenuItem id="link" href={CODE_LINK}>
          <Code size={14} />
          Code
        </MenuItem>
        <MenuItem id="link" href={DISCORD_LINK}>
          <MessageCircle size={14} />
          Discord
        </MenuItem>

        <span>
          <hr />
        </span>

        <Policy to="/terms-and-conditions">Terms and conditions</Policy>
        <Policy to="/privacy-policy">Privacy policy</Policy>
        <Policy to="/cookie-policy">Cookie policy</Policy>
      </MenuFlyout>
    </StyledMenu>
  )
}

export default Menu
