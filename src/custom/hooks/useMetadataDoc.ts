import { useEffect, useState } from 'react'
import { useActiveWeb3React } from 'hooks/web3'
import { generateReferralMetadataDoc, AppDataDoc } from 'utils/metadata'

export function useMetadataDoc() {
  const { account } = useActiveWeb3React()
  const [document, setDocument] = useState<AppDataDoc>(generateReferralMetadataDoc(account || ''))

  useEffect(() => {
    const fetchDocument = async (): Promise<AppDataDoc | undefined> => {
      if (!account) return
      /* 
        Call API with account address. If no document, return default otherwise return metadata
        setDocument(response)
      */
      return
    }

    fetchDocument()
  }, [account])

  return document
}
