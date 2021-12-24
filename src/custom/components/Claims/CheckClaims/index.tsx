import CowProtocolLogo from 'components/CowProtocolLogo'
import { useActiveWeb3React } from 'hooks/web3'
import { TopWrapper, InputField, CheckAddress } from 'pages/Claim/styled'

export const CheckClaims = () => {
  const { account } = useActiveWeb3React()

  return (
    <CheckAddress>
      <TopWrapper>
        <CowProtocolLogo size={100} />
      </TopWrapper>

      {account ? <p>You dont have anything to claim!</p> : <p>You should connect your wallet!</p>}

      <InputField>
        <b>Input address</b>
        <input placeholder="Address or ENS name" />
      </InputField>
    </CheckAddress>
  )
}
