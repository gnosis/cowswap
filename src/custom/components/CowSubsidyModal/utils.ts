import { BigNumber } from 'bignumber.js'
import { COW_SUBSIDY_DATA } from './constants'

export function getDiscountFromBalance(balance: BigNumber) {
  const [, firstDiscount] = COW_SUBSIDY_DATA[0]

  let eligibleDiscount = firstDiscount
  let tier = 0
  for (const [i, [threshold, discount]] of COW_SUBSIDY_DATA.entries()) {
    // is balance < current threshold?
    // e.g 2443 < TIER 3: >1000? FALSE
    if (balance.lt(new BigNumber(threshold))) break

    eligibleDiscount = discount
    tier = i
  }

  return { discount: eligibleDiscount, tier }
}
