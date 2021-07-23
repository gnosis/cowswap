import { useEffect, useState } from 'react'
import { useActiveWeb3React } from 'hooks/web3'

interface AffiliateDoc {
  version: string
  appCode: string
  metadata: any
}

export function useMetadataDoc() {
  const { account } = useActiveWeb3React()
  const [document, setDocument] = useState(<AffiliateDoc>{
    version: '1.0.0',
    appCode: 'CowSwap',
    metadata: {},
  })

  useEffect(() => {
    const fetchDocument = async (): Promise<AffiliateDoc | undefined> => {
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
