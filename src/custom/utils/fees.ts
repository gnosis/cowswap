import { Percent, JSBI, Fraction } from '@uniswap/sdk'
import { FeeInformation } from '../state/fee/reducer'

// TODO: remove
const DEFAULT_MINIMAL_FEE = '10'
const DEFAULT_BASE_FEE = new Percent(JSBI.BigInt(10), JSBI.BigInt(10000))
export const ONE_HUNDRED_PERCENT = new Percent(JSBI.BigInt(10000), JSBI.BigInt(10000))

type MathType = string | bigint | Fraction | Percent | JSBI

export const computeFee = (percentFee: MathType, multiplicand: MathType) =>
  ONE_HUNDRED_PERCENT.subtract(percentFee).multiply(multiplicand)

const MOCK_FEE_INFORMATION: FeeInformation = {
  expirationDate: new Date().toISOString(),
  minimalFee: DEFAULT_MINIMAL_FEE,
  feeRatio: Number(DEFAULT_BASE_FEE.toSignificant(4))
}

/**
 * @name getFee
 * @param currencyId sellToken address as string
 * @description Consume fee endpoint
 */
export const getFee = async (currencyId: string): Promise<FeeInformation> => {
  return new Promise(accept => {
    return setTimeout(() => {
      console.debug(
        `[MOCK] utils/price::getFee ==> https://protocol.dev.gnosisdev.com/api/v1/fee/${currencyId}`,
        MOCK_FEE_INFORMATION
      )
      accept(MOCK_FEE_INFORMATION)
    }, Math.floor(Math.random() * 1000))
  })
}
