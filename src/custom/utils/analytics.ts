const DOMAIN_DEV_REGEX = /cow-trade\.dev/i
const DOMAIN_STAGING_REGEX = /cow-trade\.staging/i
const DOMAIN_PROD_REGEX = /cow\.trade/i

export function getAnalyticsId(): string | undefined {
  const host = window.location.host
  if (DOMAIN_DEV_REGEX.test(host)) {
    return process.env.REACT_APP_GOOGLE_ANALYTICS_ID_DEV
  } else if (DOMAIN_STAGING_REGEX.test(host)) {
    return process.env.REACT_APP_GOOGLE_ANALYTICS_ID_STAGING
  } else if (DOMAIN_PROD_REGEX.test(host)) {
    return process.env.REACT_APP_GOOGLE_ANALYTICS_ID_PROD
  }

  return undefined
}
