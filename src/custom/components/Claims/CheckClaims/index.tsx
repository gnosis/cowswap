import { useState, useEffect } from 'react'
import { Trans } from '@lingui/macro'
import { useActiveWeb3React } from 'hooks/web3'
import { ExternalLink } from 'theme'
import { InputField, CheckAddress } from 'pages/Claim/styled'
import { isAddress } from 'ethers/lib/utils'

export const CheckClaims = () => {
  const { account } = useActiveWeb3React()

  const [inputAddress, setInputAddress] = useState('')
  const [isInputAddressValid, setIsInputAddressValid] = useState(false)

  useEffect(() => {
    setIsInputAddressValid(isAddress(inputAddress))
  }, [inputAddress])

  return (
    <CheckAddress>
      {!account ? (
        <ExternalLink href="#">
          <Trans>Connect a wallet</Trans>
        </ExternalLink>
      ) : (
        <p>You dont have any claims</p>
      )}

      <p>Enter an address to check for any eligible vCOW claims</p>

      <InputField>
        <b>Input address</b>
        <input
          placeholder="Address or ENS name"
          value={inputAddress}
          onChange={(e) => setInputAddress(e.currentTarget.value)}
        />
      </InputField>
      {!isInputAddressValid && 'Incorrect address'}
    </CheckAddress>
  )
}
