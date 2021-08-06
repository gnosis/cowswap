import React from 'react'
import AppMod from './AppMod'
import styled from 'styled-components'
import { RedirectPathToSwapOnly, RedirectToSwap } from 'pages/Swap/redirects'
import { Route, Switch } from 'react-router-dom'
import Swap from 'pages/Swap'
import PrivacyPolicy from 'pages/PrivacyPolicy'
import CookiePolicy from 'pages/CookiePolicy'
import TermsAndConditions from 'pages/TermsAndConditions'
import About from 'pages/About'
import Faq from 'pages/Faq'
import CowGame from 'pages/CowGame'
import useMarkdown from '@src/custom/hooks/useMarkdown'

// function hashCode(text: string) {
//   let hash = 0,
//     i,
//     chr
//   if (text.length === 0) return hash
//   for (i = 0; i < text.length; i++) {
//     chr = text.charCodeAt(i)
//     hash = (hash << 5) - hash + chr
//     hash |= 0 // Convert to 32bit integer
//   }

//   return hash
// }

// https://github.com/gnosis/cowswap/blob/announcements/docs/announcements.md
const ANNOUNCEMENTS_MARKDOWN_URL =
  'https://raw.githubusercontent.com/gnosis/cowswap/announcements/docs/announcements.md'

export const Wrapper = styled(AppMod)<{ announcementText: string; children?: React.ReactNode }>``

export const BodyWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding-top: 120px;
  align-items: center;
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  z-index: 1;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    padding: 0 10px 0;
  `};
`

export default function App() {
  // Ger announcement if there's one
  const announcementText = useMarkdown(ANNOUNCEMENTS_MARKDOWN_URL).trim()

  return (
    <Wrapper announcementText={announcementText}>
      <Switch>
        <Route exact strict path="/swap" component={Swap} />
        <Route exact strict path="/swap/:outputCurrency" component={RedirectToSwap} />
        <Route exact strict path="/send" component={RedirectPathToSwapOnly} />
        <Route exact strict path="/about" component={About} />
        <Route exact strict path="/faq" component={Faq} />
        <Route exact strict path="/play" component={CowGame} />
        <Route exact strict path="/privacy-policy" component={PrivacyPolicy} />
        <Route exact strict path="/cookie-policy" component={CookiePolicy} />
        <Route exact strict path="/terms-and-conditions" component={TermsAndConditions} />
        <Route component={RedirectPathToSwapOnly} />
      </Switch>
    </Wrapper>
  )
}
