import detectEthereumProvider from '@metamask/detect-provider'

export async function generateAffiliateLink(callback: any) {
  if (typeof window.ethereum == 'undefined') return
  const provider: any = await detectEthereumProvider()
  const accounts: Array<string> = await provider.request({
    method: 'eth_requestAccounts',
  })
  let link = null
  if (accounts.length > 0) link = `${window.location.href}/#/?referral=${accounts[0]}`
  console.log('GEN LINK =>', link)
  if (callback) return callback(link)
}
