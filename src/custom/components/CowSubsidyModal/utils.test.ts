/**
 * @jest-environment ./custom-test-env.js
 */
import { BigNumber } from 'bignumber.js'
import { getDiscountFromBalance } from './utils'

const MOCK_TIER_DATA: { [threshold: string]: number } = {
  '0': 0,
  '100': 10,
  '1000': 15,
  '10000': 25,
  '100000': 35,
}

const MOCK_BALANCES = [0, 150, 3512, 64884, 5501230]
const FALSE_MOCK_BALANCES = [100, 99, 10002, 12, 0]

describe('FEE DISCOUNT TIERS', () => {
  describe('CORRECT DISCOUNTS', () => {
    Object.entries(MOCK_TIER_DATA).forEach(([threshold, discount], i) => {
      it(`USER BALANCE: [${MOCK_BALANCES[i]}] === TIER ${i}: [${
        i ? '>' : ''
      }${threshold}] => ${discount}% DISCOUNT`, () => {
        const BALANCE_BN = new BigNumber(MOCK_BALANCES[i])
        expect(getDiscountFromBalance(BALANCE_BN)).toEqual(discount)
      })
    })
  })
  describe('INCORRECT DISCOUNTS', () => {
    Object.entries(MOCK_TIER_DATA).forEach(([threshold, discount], i) => {
      it(`USER BALANCE: [${FALSE_MOCK_BALANCES[i]}] !== TIER ${i}: [${
        i ? '>' : ''
      }${threshold}] => ${discount}% DISCOUNT`, () => {
        const BALANCE_BN = new BigNumber(FALSE_MOCK_BALANCES[i])
        expect(getDiscountFromBalance(BALANCE_BN)).not.toEqual(discount)
      })
    })
  })
})
