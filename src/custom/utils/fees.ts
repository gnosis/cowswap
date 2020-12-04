interface FeeInformation {
  expirationDate: string
  minimalFee: string
  feeRatio: number
}

// TODO: remove
const ONE_WEEKS_MS = 604800000
const DEFAULT_BASIS_POINTS = 10
const DEFAULT_MINIMAL_FEE = '10'

const MOCK_FEE_INFORMATION: FeeInformation = {
  get expirationDate() {
    return new Date(Date.now() + ONE_WEEKS_MS).toISOString()
  },
  minimalFee: DEFAULT_MINIMAL_FEE,
  feeRatio: DEFAULT_BASIS_POINTS
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
