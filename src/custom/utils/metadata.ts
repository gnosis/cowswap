import CID from 'cids'
import multihashes from 'multihashes'
import { pinJSONToIPFS } from 'api/ipfs'

interface Metadata {
  version: string
}

export interface ReferralMetadata extends Metadata {
  address: string
}

export type MetadataDoc = {
  referrer?: ReferralMetadata
}

export type AppDataDoc = {
  version: string
  appCode?: string
  metadata: MetadataDoc
}

export const DEFAULT_APP_CODE = 'CowSwap'

export function generateReferralMetadataDoc(
  referralAddress: string,
  appDataDoc: AppDataDoc = generateAppDataDoc()
): AppDataDoc {
  return {
    ...appDataDoc,
    metadata: {
      ...appDataDoc.metadata,
      referrer: {
        address: referralAddress,
        version: '0.1.0',
      },
    },
  }
}

export function generateAppDataDoc(metadata: MetadataDoc = {}): AppDataDoc {
  return {
    version: '0.1.0',
    appCode: DEFAULT_APP_CODE,
    metadata: {
      ...metadata,
    },
  }
}

export async function uploadMetadataDocToIpfs(appDataDoc: AppDataDoc): Promise<string> {
  const { IpfsHash } = await pinJSONToIPFS(appDataDoc)
  const { digest } = multihashes.decode(new CID(IpfsHash).multihash)
  return `0x${Buffer.from(digest).toString('hex')}`
}

const fromHexString = (hexString: string) => {
  const stringMatch = hexString.match(/.{1,2}/g)
  if (!stringMatch) return
  return new Uint8Array(stringMatch.map((byte) => parseInt(byte, 16)))
}

function buildCidInstance(hash: string) {
  const cidVersion = 0x1 //.toString(16) //cidv1
  const codec = 0x70 //.toString(16) //dag-pb
  const type = 0x12 //.toString(16) //sha2-256
  const length = 32 //.toString(16) //256 bits
  const _hash = hash.replace(/(^0x)/, '')

  const hexHash = fromHexString(_hash)

  if (!hexHash) return

  const uint8array = Uint8Array.from([cidVersion, codec, type, length, ...hexHash])

  return new CID(uint8array)
}

async function loadIpfsFromCid(cid: string) {
  const response = await fetch(`https://gnosis.mypinata.cloud/ipfs/${cid}`)

  return await response.json()
}

export async function decodeAppData(hash: string) {
  const cid = buildCidInstance(hash)
  if (!cid) return
  let cidV0
  try {
    cidV0 = cid.toV0().toString()
    console.log(`CIDv0 for hash '${hash}': '${cidV0}'`)
  } catch (e) {
    console.error(`Not able to extract CIDv0 from hash '${hash}'`, e)
    return
  }

  try {
    return await loadIpfsFromCid(cidV0)
  } catch (e) {
    console.error(`Failed to fetch data from IPFS for CIDv0 ${cidV0} (hash ${hash})`, e)
  }
}
