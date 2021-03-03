import { useActiveWeb3React } from '@src/hooks'
import { useEffect } from 'react'
import ReactGA from 'react-ga'
import { RouteComponentProps } from 'react-router-dom'
import { NETWORK_LABELS } from 'components/Header'

const NETWORK_DIMENSION = 'dimension1'

export default function GoogleAnalyticsReporter({ location: { pathname, search } }: RouteComponentProps): null {
  const { chainId } = useActiveWeb3React()

  // Update the GA network dimension
  useEffect(() => {
    const networkInfo = chainId ? NETWORK_LABELS[chainId] : 'Not connected'
    ReactGA.set({
      [NETWORK_DIMENSION]: networkInfo
    })
  }, [chainId])

  // Fires a GA pageview every time the route changes
  useEffect(() => {
    ReactGA.pageview(`${pathname}${search}`)
  }, [pathname, search])
  return null
}
