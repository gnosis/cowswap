import '@reach/dialog/styles.css'
import 'inter-ui'
import 'polyfills'
import 'components/analytics'
import { createWeb3ReactRoot, Web3ReactProvider } from '@web3-react/core'
import { StrictMode } from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { HashRouter } from 'react-router-dom'
import Blocklist from 'components/Blocklist'
import { NetworkContextName } from 'constants/misc'
import { LanguageProvider } from 'i18n'
import App from 'pages/App'
import * as serviceWorkerRegistration from './serviceWorkerRegistration'
import store from 'state'
import ApplicationUpdater from 'state/application/updater'
import ListsUpdater from 'state/lists/updater'
import LogsUpdater from 'state/logs/updater'
import MulticallUpdater from 'state/multicall/updater'
import TransactionUpdater from 'state/transactions/updater'
import EnhancedTransactionUpdater from 'state/enhancedTransactions/updater'
import UserUpdater from 'state/user/updater'
import FeesUpdater from 'state/price/updater'
import GasUpdater from 'state/gas/updater'
import {
  GpOrdersUpdater,
  CancelledOrdersUpdater,
  PendingOrdersUpdater,
  UnfillableOrdersUpdater,
} from 'state/orders/updaters'
// import { EventUpdater } from 'state/orders/mocks'
import ThemeProvider, { FixedGlobalStyle, ThemedGlobalStyle } from 'theme'
import getLibrary from 'utils/getLibrary'
import AppziButton from 'components/AppziButton'
import RadialGradientByChainUpdater from 'theme/RadialGradientByChainUpdater'
import { nodeRemoveChildFix } from 'utils/node'
import { devLog } from 'utils/logging'

// Node removeChild hackaround
// based on: https://github.com/facebook/react/issues/11538#issuecomment-417504600
nodeRemoveChildFix()

const Web3ProviderNetwork = createWeb3ReactRoot(NetworkContextName)

if (!!window.ethereum) {
  window.ethereum.autoRefreshOnNetworkChange = false
}

function Updaters() {
  return (
    <>
      <RadialGradientByChainUpdater />
      <ListsUpdater />
      <UserUpdater />
      <ApplicationUpdater />
      <TransactionUpdater />
      <EnhancedTransactionUpdater />
      <MulticallUpdater />
      <PendingOrdersUpdater />
      <CancelledOrdersUpdater />
      <FeesUpdater />
      <UnfillableOrdersUpdater />
      <GpOrdersUpdater />
      <GasUpdater />
      <LogsUpdater />
    </>
  )
}

ReactDOM.render(
  <StrictMode>
    <FixedGlobalStyle />
    <Provider store={store}>
      <HashRouter>
        <LanguageProvider>
          <Web3ReactProvider getLibrary={getLibrary}>
            <Web3ProviderNetwork getLibrary={getLibrary}>
              <Blocklist>
                <Updaters />
                <ThemeProvider>
                  <ThemedGlobalStyle />
                  <AppziButton />
                  <App />
                </ThemeProvider>
              </Blocklist>
            </Web3ProviderNetwork>
          </Web3ReactProvider>
        </LanguageProvider>
      </HashRouter>
    </Provider>
  </StrictMode>,
  document.getElementById('root')
)

// if (process.env.REACT_APP_SERVICE_WORKER !== 'false') {
//   serviceWorkerRegistration.register()
// }

async function deleteAllCaches() {
  const cacheNames = (await caches.keys()) || []

  cacheNames.map((cacheName) => {
    devLog('[worker] Delete cache', cacheName)
    // Delete old caches
    // https://developers.google.com/web/ilt/pwa/caching-files-with-service-worker#removing_outdated_caches
    return caches.delete(cacheName)
  })
}

async function unregisterAllWorkers() {
  navigator.serviceWorker.getRegistrations().then(function (registrations) {
    for (const registration of registrations) {
      registration.unregister()
    }
  })
}

if ('serviceWorker' in navigator) {
  devLog('[worker] Unregister worker...')
  serviceWorkerRegistration.unregister()

  devLog('[worker] Deleting all caches...')
  deleteAllCaches()
    .then(() => devLog('[worker] All caches have been deleted'))
    .catch(console.error)

  devLog('[worker] Unregistering all workers...')
  unregisterAllWorkers()
    .then(() => devLog('[worker] All workers have been unregistered'))
    .catch(console.error)
}
