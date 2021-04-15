export function getDomainRegex(domainPrefix: string | undefined): RegExp | undefined {
  return domainPrefix ? new RegExp('^' + domainPrefix.replaceAll('.', '\\.'), 'i') : undefined
}

export function checkEnvironment(host?: string) {
  const domainDevRegex = getDomainRegex(process.env.REACT_APP_DOMAIN_PREFIX_DEV)
  const domainStagingRegex = getDomainRegex(process.env.REACT_APP_DOMAIN_PREFIX_STAGING)
  const domainProdRegex = getDomainRegex(process.env.REACT_APP_DOMAIN_PREFIX_PROD)

  const hostToCheck = host || window.location.host

  return {
    isDev: domainDevRegex?.test(hostToCheck),
    isStaging: domainStagingRegex?.test(hostToCheck),
    isProd: domainProdRegex?.test(hostToCheck)
  }
}
