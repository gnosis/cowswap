import { checkEnvironment } from './environments'

export function getAnalyticsId(): string | undefined {
  const { isDev, isStaging, isProd } = checkEnvironment(window.location.host)

  if (isDev) {
    return process.env.REACT_APP_GOOGLE_ANALYTICS_ID_DEV
  } else if (isStaging) {
    return process.env.REACT_APP_GOOGLE_ANALYTICS_ID_STAGING
  } else if (isProd) {
    return process.env.REACT_APP_GOOGLE_ANALYTICS_ID_PROD
  }

  return undefined
}
