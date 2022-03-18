import { BigNumber } from 'bignumber.js'
import { COW_SUBSIDY_DATA } from './constants'

const LAST_INDEX = COW_SUBSIDY_DATA.length - 1
const [, firstDiscount] = COW_SUBSIDY_DATA[0]

export function getDiscountFromBalance(balanceAtomsBn: BigNumber) {
  let discount = firstDiscount
  let tier = 0
  // Here we use a sliced verison of our data without index 0 (0 amt tier)
  // because loop-wise a balance less than or equal to 0 and 100 (indices 0 and 1, respectively) are the same
  for (const [threshold, thresholdDiscount] of COW_SUBSIDY_DATA.slice(1)) {
    // Increase our tier number only if we're not at the end of our list
    if (tier < LAST_INDEX) {
      // Is balance less than or equal to threshold?
      // break. it's our tier.
      const thresholdBn = new BigNumber(threshold)
      if (balanceAtomsBn.lte(thresholdBn)) break

      // Else assign the current discount as the threshold and iterate one tier
      discount = thresholdDiscount
      tier++
    }
  }

  return { discount, tier }
}
