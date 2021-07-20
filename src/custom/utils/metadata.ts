interface IMetadata {
  kind: MetadataKind
  version: string
}

export enum MetadataKind {
  REFERRAL = 'referrer',
}

export type Metadata = {
  [MetadataKind.REFERRAL]: IReferralMetadata
}

export type MetadataDoc = {
  version: string
  appCode?: string
  metadata: Metadata
}

export interface IReferralMetadata extends IMetadata {
  referrer: string
}

export const DEFAULT_APP_CODE = 'CowSwap'

export const generateReferralMetadataDoc = (referralAddress: string): MetadataDoc => {
  return {
    version: '1.0.0',
    appCode: DEFAULT_APP_CODE,
    metadata: {
      referrer: {
        kind: MetadataKind.REFERRAL,
        referrer: referralAddress,
        version: '1.0.0',
      },
    },
  }
}
