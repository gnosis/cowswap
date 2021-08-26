import deterministicHash from 'utils/deterministicHash'
import { UploadMetadataParams } from 'utils/operator/operatorApi'

export async function uploadAppDataDoc(params: UploadMetadataParams): Promise<string> {
  console.log('[utils:operatorMock] Post AppData doc', params)

  return deterministicHash(params.metadata)
}
