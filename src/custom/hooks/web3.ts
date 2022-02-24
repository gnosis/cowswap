import { Web3Provider } from '@ethersproject/providers'
import { useWeb3React } from '@web3-react/core'
import { useEffect, useState, useCallback } from 'react'

import { gnosisSafe, injected, walletconnect, getProviderType, WalletProvider } from 'connectors'
import { IS_IN_IFRAME, NetworkContextName } from 'constants/misc'
import { isMobile } from 'utils/userAgent'

import { STORAGE_KEY_LAST_PROVIDER } from 'constants/index'

export function useActiveWeb3React() {
  const context = useWeb3React<Web3Provider>()
  const contextNetwork = useWeb3React<Web3Provider>(NetworkContextName)
  return context.active ? context : contextNetwork
}

export function useEagerConnect() {
  const { activate, active, connector } = useWeb3React()
  const [tried, setTried] = useState(false)

  // gnosisSafe.isSafeApp() races a timeout against postMessage, so it delays pageload if we are not in a safe app;
  // if we are not embedded in an iframe, it is not worth checking
  const [triedSafe, setTriedSafe] = useState(!IS_IN_IFRAME)

  // handle setting/removing wallet provider in local storage
  const handleBeforeUnload = useCallback(() => {
    const walletType = getProviderType(connector)

    if (!walletType || !active) {
      localStorage.removeItem(STORAGE_KEY_LAST_PROVIDER)
    } else {
      localStorage.setItem(STORAGE_KEY_LAST_PROVIDER, walletType)
    }
  }, [connector, active])

  const connectInjected = useCallback(() => {
    // check if the our application is authorized/connected with Metamask
    injected.isAuthorized().then((isAuthorized) => {
      if (isAuthorized) {
        activate(injected, undefined, true).catch(() => {
          setTried(true)
        })
      } else {
        if (isMobile && window.ethereum) {
          activate(injected, undefined, true).catch(() => {
            setTried(true)
          })
        } else {
          setTried(true)
        }
      }
    })
  }, [activate, setTried])

  const connectWalletConnect = useCallback(() => {
    activate(walletconnect, undefined, true).catch(() => {
      setTried(true)
    })
  }, [activate, setTried])

  const connectSafe = useCallback(() => {
    gnosisSafe.isSafeApp().then((loadedInSafe) => {
      if (loadedInSafe) {
        activate(gnosisSafe, undefined, true).catch(() => {
          setTriedSafe(true)
        })
      } else {
        setTriedSafe(true)
      }
    })
  }, [activate, setTriedSafe])

  useEffect(() => {
    if (!active) {
      const latestProvider = localStorage.getItem(STORAGE_KEY_LAST_PROVIDER)

      // if there is no last saved provider set tried state to true
      if (!latestProvider) {
        if (!triedSafe) {
          // First try to connect using Gnosis Safe
          connectSafe()
        } else {
          // Then try to connect using the injected wallet
          connectInjected()
        }
      } else if (latestProvider === WalletProvider.GNOSIS_SAFE) {
        connectSafe()
      } else if (latestProvider === WalletProvider.INJECTED) {
        // MM is last provider
        connectInjected()
      } else if (latestProvider === WalletProvider.WALLET_CONNECT) {
        // WC is last provider
        connectWalletConnect()
      }
    }
  }, [connectInjected, connectSafe, connectWalletConnect, active, triedSafe]) // intentionally only running on mount (make sure it's only mounted once :))

  useEffect(() => {
    // add beforeunload event listener on initial component mount
    window.addEventListener('beforeunload', handleBeforeUnload)

    // remove beforeunload event listener on component unmount
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  })

  return tried
}

/**
 * Use for network and injected - logs user in
 * and out after checking what network theyre on
 */
export function useInactiveListener(suppress = false) {
  const { active, error, activate } = useWeb3React()

  useEffect(() => {
    const { ethereum } = window

    if (ethereum && ethereum.on && !active && !error && !suppress) {
      const handleChainChanged = () => {
        // eat errors
        activate(injected, undefined, true).catch((error) => {
          console.error('Failed to activate after chain changed', error)
        })
      }

      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length > 0) {
          // eat errors
          activate(injected, undefined, true).catch((error) => {
            console.error('Failed to activate after accounts changed', error)
          })
        }
      }

      ethereum.on('chainChanged', handleChainChanged)
      ethereum.on('accountsChanged', handleAccountsChanged)

      return () => {
        if (ethereum.removeListener) {
          ethereum.removeListener('chainChanged', handleChainChanged)
          ethereum.removeListener('accountsChanged', handleAccountsChanged)
        }
      }
    }
    return undefined
  }, [active, error, suppress, activate])
}
