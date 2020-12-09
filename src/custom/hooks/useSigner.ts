import { useActiveWeb3React } from '@src/hooks'
import { Signer, VoidSigner } from 'ethers'

export function useSigner(): Signer | undefined {
  const { library, account } = useActiveWeb3React()

  if (account && !library) {
    return new VoidSigner(account, library)
  } else {
    return undefined
  }
}
