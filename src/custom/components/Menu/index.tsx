import React from 'react'
import { Code, MessageCircle, IconProps } from 'react-feather'

import MenuMod, { MenuItem, InternalMenuItem } from './MenuMod'
import styled from 'styled-components'
import { FOOTER_URLS } from '../Footer'

const CODE_LINK = 'https://github.com/gnosis/dex-swap'
const DISCORD_LINK = 'https://chat.gnosis.io'

export const StyledMenu = styled(MenuMod)``

// remove static gnosis text and leave urls
const CONTENT_URLS = FOOTER_URLS.slice(1) as { name: string; url: string; Icon?: React.FC<IconProps> }[]

export function Menu() {
  return (
    <StyledMenu>
      <MenuItem id="link" href={CODE_LINK}>
        <Code size={14} />
        Code
      </MenuItem>
      <MenuItem id="link" href={DISCORD_LINK}>
        <MessageCircle size={14} />
        Discord
      </MenuItem>
      {CONTENT_URLS.map(({ name, url, Icon }, index) => (
        <InternalMenuItem key={url + '_' + index} to={url}>
          {Icon && <Icon size={14} />}
          {name}
        </InternalMenuItem>
      ))}
    </StyledMenu>
  )
}

export default Menu
