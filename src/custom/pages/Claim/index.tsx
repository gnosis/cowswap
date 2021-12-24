import { useActiveWeb3React } from 'hooks/web3'
import { useUserAvailableClaims } from 'state/claim/hooks'
import { ClaimsTable } from 'components/Claims/ClaimsTable'
import { CheckClaims } from 'components/Claims/CheckClaims'
import { PageWrapper } from './styled'

export default function Claim() {
  const { account } = useActiveWeb3React()

  // get user claim data
  const userClaimData = useUserAvailableClaims(account)

  return (
    <PageWrapper>
      {!userClaimData.length || !account ? <CheckClaims /> : null}
      {userClaimData.length && account ? <ClaimsTable /> : null}
    </PageWrapper>
  )
}
