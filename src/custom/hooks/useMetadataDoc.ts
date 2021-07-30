import { useEffect, useState } from 'react'
import { useActiveWeb3React } from 'hooks/web3'
import { generateReferralMetadataDoc, AppDataDoc } from 'utils/metadata'
import useParseReferralQueryParam from 'hooks/useParseReferralQueryParam'

export function useMetadataDoc() {
  const { account } = useActiveWeb3React()
  const referralAddress = useParseReferralQueryParam()
  const [document, setDocument] = useState<AppDataDoc>(generateReferralMetadataDoc(referralAddress || ''))

  useEffect(() => {
    if (!account) return
    setDocument(generateReferralMetadataDoc(account))
  }, [account])

  return document
}
