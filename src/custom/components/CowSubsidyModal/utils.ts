import { BigNumber } from 'bignumber.js'
import { COW_SUBSIDY_DATA } from './constants'

export function getDiscountFromBalance(balanceAtomsBn: BigNumber) {
  const [, firstDiscount] = COW_SUBSIDY_DATA[0]

  let discount = firstDiscount
  let tier = 0
  for (const [threshold, thresholdDiscount] of COW_SUBSIDY_DATA) {
    // is balance < current threshold?
    // e.g 2443 < TIER 3: >1000? FALSE
    if (balanceAtomsBn.lt(new BigNumber(threshold))) break

    discount = thresholdDiscount
    tier++
  }

  return { discount, tier }
}
