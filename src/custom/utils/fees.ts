// TODO: add mock API using Alex's created open API definition of tip endpoint
/**
 * @name getTip
 * @param currencyId token address as string
 * @description queries oba services endpoint for sell token tip amount set by operator
 */
export const getTip = async (currencyId: string): Promise<string> =>
  new Promise(accept => {
    return setTimeout(() => {
      console.debug(`[MOCK] utils/price::getTip ==> API request for token ${currencyId}`)
      const computedTip = Math.floor(Math.random() * 10).toString()
      accept(computedTip)
    }, Math.floor(Math.random() * 1000))
  })
