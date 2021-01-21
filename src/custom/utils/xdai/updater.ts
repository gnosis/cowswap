import { useActiveWeb3React } from 'hooks'
import { switchParamsByNetwork } from './hack'

export default function Updater(): null {
  const { chainId } = useActiveWeb3React()

  // sync update to not rely on useEffect timing
  switchParamsByNetwork(chainId)

  return null
}
