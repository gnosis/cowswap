import { Code, MessageCircle, HelpCircle, BookOpen, PieChart, Moon, Sun, Repeat, Star } from 'react-feather'

import MenuMod, { MenuItem, InternalMenuItem, MenuFlyout as MenuFlyoutUni, MenuItemBase } from './MenuMod'
import { useToggleModal } from 'state/application/hooks'
import styled from 'styled-components/macro'
import { Separator as SeparatorBase } from 'components/SearchModal/styleds'
import { CONTRACTS_CODE_LINK, DISCORD_LINK, DOCS_LINK, DUNE_DASHBOARD_LINK } from 'constants/index'
import GameIcon from 'assets/cow-swap/game.gif'
import { ApplicationModal } from 'state/application/actions'

import TwitterImage from 'assets/cow-swap/twitter.svg'
import { ExternalLink } from 'theme'

export * from './MenuMod'

const ResponsiveInternalMenuItem = styled(InternalMenuItem)`
  display: none;

  ${({ theme }) => theme.mediaWidth.upToMedium`
      display: flex;   
  `};
`

const MenuItemResponsiveBase = styled.div`
  ${MenuItemBase}
  display: none;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    display: flex;   
  `};
`

const MenuItemResponsive = styled(MenuItemResponsiveBase)`
  font-weight: 500;
  flex: 0 1 auto;
  padding: 16px;
  font-size: 18px;
  svg {
    width: 18px;
    height: 18px;
    object-fit: contain;
    margin: 0 8px 0 0;
  }
`

export const StyledMenu = styled(MenuMod)`
  hr {
    margin: 15px 0;
  }

  ${MenuItem},
  ${InternalMenuItem},
  ${MenuItemResponsive} {
    color: ${({ theme }) => theme.header.menuFlyout.color};
    background: ${({ theme }) => theme.header.menuFlyout.background};
    :hover {
      color: ${({ theme }) => theme.header.menuFlyout.colorHover};
      background: ${({ theme }) => theme.header.menuFlyout.colorHoverBg};
    }
  }

  span[aria-label='Play CowGame'] > img {
    width: 20px;
    height: 20px;
    object-fit: contain;
    padding: 0 4px 0 0;
  }
`

const Policy = styled(InternalMenuItem).attrs((attrs) => ({
  ...attrs,
}))`
  font-size: 0.8em;
  text-decoration: underline;
`

const MenuFlyout = styled(MenuFlyoutUni)`
  min-width: 11rem;
  box-shadow: 0 0 100vh 100vw rgb(0 0 0 / 25%);
  top: calc(100% + 16px);
  order: 1;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    top: 0;
    left: 0;
    position: fixed;
    height: 100vh;
    width: 100vw;
    border-radius: 0;
    box-shadow: none;
    padding: 0;
    overflow-y: auto;
  `};

  > a:not(${ResponsiveInternalMenuItem}) {
    display: flex;
  }

  > a {
    transition: background 0.2s ease-in-out;
    align-items: center;
    text-decoration: none;

    ${({ theme }) => theme.mediaWidth.upToSmall`
      flex: 0 1 auto;
      padding: 16px;
      font-size: 18px;
        svg {
          width: 18px;
          height: 18px;
          object-fit: contain;
          margin: 0 8px 0 0;
        }
    `};

    > span {
      display: flex;
      align-items: center;
    }

    > span > svg {
      margin: 0 8px 0 0;
    }
  }
  > a:hover {
    background: ${({ theme }) => theme.disabled};
    border-radius: 6px;
  }
`

export const Separator = styled(SeparatorBase)`
  background-color: ${({ theme }) => theme.disabled};
  margin: 0.3rem auto;
  width: 90%;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    width: 100%;
    margin: 24px auto;
  `};
`

export const CloseMenu = styled.button`
  display: grid;
  justify-content: space-between;
  align-items: center;
  background: ${({ theme }) => theme.header.menuFlyout.closeButtonBg};
  border: 0;
  color: ${({ theme }) => theme.black};
  height: 36px;
  position: sticky;
  top: 0;
  cursor: pointer;
  border-radius: 6px;
  justify-content: center;
  padding: 0;
  margin: 0 0 8px;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    height: 48px;
    border-radius: 0;
    justify-content: flex-end;
  `};

  &::after {
    content: '✕';
    display: block;
    font-size: 20px;
    margin: 0;

    ${({ theme }) => theme.mediaWidth.upToSmall`
      margin: 0 14px 0 0;
      font-size: 24px;
    `};
  }
`

interface MenuProps {
  darkMode: boolean
  toggleDarkMode: () => void
}

export function Menu({ darkMode, toggleDarkMode }: MenuProps) {
  const close = useToggleModal(ApplicationModal.MENU)

  return (
    <StyledMenu>
      <MenuFlyout>
        <CloseMenu onClick={close} />
        <ResponsiveInternalMenuItem to="/" onClick={close}>
          <Repeat size={14} /> Swap
        </ResponsiveInternalMenuItem>
        <ResponsiveInternalMenuItem to="/about" onClick={close}>
          <Star size={14} /> About
        </ResponsiveInternalMenuItem>

        <InternalMenuItem to="/faq" onClick={close}>
          <HelpCircle size={14} />
          FAQ
        </InternalMenuItem>

        <MenuItem id="link" href={DOCS_LINK}>
          <BookOpen size={14} />
          Docs
        </MenuItem>

        <MenuItem id="link" href={DUNE_DASHBOARD_LINK}>
          <PieChart size={14} />
          Stats
        </MenuItem>

        <MenuItem id="link" href={CONTRACTS_CODE_LINK}>
          <span aria-hidden="true" onClick={close} onKeyDown={close}>
            <Code size={14} />
            Code
          </span>
        </MenuItem>
        <MenuItem id="link" href={DISCORD_LINK}>
          <span aria-hidden="true" onClick={close} onKeyDown={close}>
            <MessageCircle size={14} />
            Discord
          </span>
        </MenuItem>

        <MenuItemResponsive>
          <ExternalLink href="https://twitter.com/mevprotection" target="_blank">
            <img src={TwitterImage} alt="Follow CowSwap on Twitter!" /> Twitter
          </ExternalLink>
        </MenuItemResponsive>

        <InternalMenuItem to="/play" onClick={close}>
          <span role="img" aria-label="Play CowGame">
            <img src={GameIcon} alt="Play CowGame" />
          </span>{' '}
          CowGame
        </InternalMenuItem>

        <MenuItemResponsive onClick={() => toggleDarkMode()}>
          {darkMode ? (
            <>
              <Moon size={20} /> Dark Theme
            </>
          ) : (
            <>
              <Sun size={20} />
              Light Theme
            </>
          )}
        </MenuItemResponsive>

        <Separator />

        <Policy to="/terms-and-conditions" onClick={close} onKeyDown={close}>
          Terms and conditions
        </Policy>
        {/* 
        <Policy to="/privacy-policy">Privacy policy</Policy>
        <Policy to="/cookie-policy">Cookie policy</Policy> 
        */}
      </MenuFlyout>
    </StyledMenu>
  )
}

export default Menu
