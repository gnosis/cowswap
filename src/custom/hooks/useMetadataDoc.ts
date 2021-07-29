import { useEffect, useState } from 'react'
import { useActiveWeb3React } from 'hooks/web3'
import { generateReferralMetadataDoc, AppDataDoc } from 'utils/metadata'

export function useMetadataDoc() {
  const { account } = useActiveWeb3React()
  const [document, setDocument] = useState<AppDataDoc>(generateReferralMetadataDoc(account || ''))

  useEffect(() => {
    if (!account) return
    setDocument(generateReferralMetadataDoc(account))
  }, [account])

  return document
}
