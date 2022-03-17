import { BigNumber } from 'bignumber.js'
import { COW_SUBSIDY_DATA } from './constants'

export function getDiscountFromBalance(balance: BigNumber) {
  const thresholdsList = Object.keys(COW_SUBSIDY_DATA)

  // in case of data update, we can dynamically fetch the values
  const FIRST_KEY = thresholdsList[0]
  const LAST_KEY = thresholdsList.slice().pop() as string

  const thresholdsListBN = thresholdsList.map((thres) => new BigNumber(thres))

  // Is balance less than the first position threshold? then it's 0 tier discount
  if (balance.lt(thresholdsListBN[1])) {
    return COW_SUBSIDY_DATA[FIRST_KEY]
  } else if (balance.gte(thresholdsListBN[thresholdsListBN.length - 1])) {
    return COW_SUBSIDY_DATA[LAST_KEY]
  }

  // algo expects negative Number, so we cast toNumber()
  const sortedList = thresholdsListBN.concat(balance).sort((a, b) => a.minus(b).toNumber())

  // can search from position 1 since we check 0 above
  // could also technically just pop the last but meh
  const tier = sortedList.indexOf(balance, 1)
  const key = thresholdsList[tier - 1]
  // tier will always be BETWEEN our 2 set indices, so it's the less of the 2
  return COW_SUBSIDY_DATA[key]
}
