import { ChainId } from 'state/lists/actions'
import deterministicHash from '../deterministicHash'
import { AppMetadata, UploadMetadataParams } from './operatorApi'

const appDataDoc = {
  version: '1.0.0',
  appCode: 'CowSwap',
  metadata: {
    referrer: {
      address: '0x1811be0994930fE9480eAEDe25165608B093ad7A',
      version: '1.0.0',
    },
  },
}

const appMetadataResponse: AppMetadata = {
  hash: deterministicHash(appDataDoc),
  metadata: appDataDoc,
  user: appDataDoc.metadata.referrer.address,
}

export async function getAppDataDoc(chainId: ChainId, address: string): Promise<AppMetadata | null> {
  console.log(
    '[util:operator] Get AppData doc for',
    chainId,
    address,
    address === appDataDoc.metadata.referrer.address
      ? ''
      : `. Pass ${appDataDoc.metadata.referrer.address} as address to return a valid appData document`
  )

  if (address === appDataDoc.metadata.referrer.address) {
    return appMetadataResponse
  }

  return null
}

export async function uploadAppDataDoc(params: UploadMetadataParams): Promise<void> {
  console.log('[utils:operatorMock] Post AppData doc', params)
  return
}
