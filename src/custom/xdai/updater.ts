import { useActiveWeb3React } from 'hooks'
import { switchXDAIparams } from '.'

export default function Updater(): null {
  const { chainId } = useActiveWeb3React()

  // sync update to not rely on useEffect timing
  switchXDAIparams(chainId)

  return null
}
