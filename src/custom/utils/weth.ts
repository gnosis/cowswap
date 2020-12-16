import { Contract } from 'ethers'
import { delay } from './misc'

export async function wrapEther(amount: string, weth: Contract): Promise<string> {
  console.log('Wrapping ETH!', amount, weth)
  await delay(10000) // 10s
  console.log('Wrapped!', amount)

  return '0xa049b8d0bbdd100e9bc884475c10901dcce8af5a'
}
