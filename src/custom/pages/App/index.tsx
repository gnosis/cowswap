import React from 'react'
import AppMod from './AppMod'
import styled from 'styled-components'
import { RedirectPathToSwapOnly, RedirectToSwap } from 'pages/Swap/redirects'
import { Route, Switch } from 'react-router-dom'
import Swap from 'pages/Swap'
// import PrivacyPolicy from 'pages/PrivacyPolicy'
// import CookiePolicy from 'pages/CookiePolicy'
import TermsAndConditions from 'pages/TermsAndConditions'
import About from 'pages/About'
import Faq from 'pages/Faq'
import CowGame from 'pages/CowGame'
import CowGameModal from '@src/custom/components/CowGameModal/CowGameModal'
import { useModalOpen, useToggleModal } from 'state/application/hooks'
import { ApplicationModal } from '@src/state/application/actions'

function TopLevelModals() {
  // const open = useModalOpen(ApplicationModal.ADDRESS_CLAIM)
  // const toggle = useToggleModal(ApplicationModal.ADDRESS_CLAIM)
  // return <AddressClaimModal isOpen={open} onDismiss={toggle} />

  const open = useModalOpen(ApplicationModal.COW_GAME)
  const toggle = useToggleModal(ApplicationModal.COW_GAME)
  return <CowGameModal isOpen={open} onDismiss={toggle} />
}

export const Wrapper = styled(AppMod)``

export default function App() {
  return (
    <Wrapper>
      <TopLevelModals />

      <Switch>
        <Route exact strict path="/swap" component={Swap} />
        <Route exact strict path="/swap/:outputCurrency" component={RedirectToSwap} />
        <Route exact strict path="/send" component={RedirectPathToSwapOnly} />
        <Route exact strict path="/about" component={About} />
        <Route exact strict path="/faq" component={Faq} />
        <Route exact strict path="/play" component={CowGame} />
        {/* <Route exact strict path="/privacy-policy" component={PrivacyPolicy} />
        <Route exact strict path="/cookie-policy" component={CookiePolicy} /> */}
        <Route exact strict path="/terms-and-conditions" component={TermsAndConditions} />
        <Route component={RedirectPathToSwapOnly} />
      </Switch>
    </Wrapper>
  )
}
