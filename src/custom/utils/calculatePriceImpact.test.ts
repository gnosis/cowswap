import { ChainId, WETH } from '@uniswap/sdk'
import { Token } from '@uniswap/sdk-core'
import { parseUnits } from 'ethers/lib/utils'

import { calculateFallbackPriceImpact } from './price'

const WETH_MAINNET = new Token(ChainId.MAINNET, WETH[1].address, 18)
const DAI_MAINNET = new Token(ChainId.MAINNET, '0x6b175474e89094c44da98b954eedeac495271d0f', 18)

const ABA_CASES = [
  {
    initialValue: parseUnits('80', DAI_MAINNET.decimals).toString(),
    finalValue: parseUnits('56', DAI_MAINNET.decimals).toString(),
    expectation: '15',
    description: '[SELL] 100 WETH > 80 DAI > 56 WETH',
  },
  {
    initialValue: parseUnits('0.48', WETH_MAINNET.decimals).toString(),
    finalValue: parseUnits('0.61', WETH_MAINNET.decimals).toString(),
    expectation: '-14',
    description: '[BUY] 700 DAI > 0.48 WETH > 0.61 WETH',
  },
  {
    initialValue: parseUnits('80', DAI_MAINNET.decimals).toString(),
    finalValue: parseUnits('56', DAI_MAINNET.decimals).toString(),
    expectation: '15',
    description: '[SELL] 100 WETH > 80 DAI > 56 WETH',
  },
]

// describe('A > B > A Price Impact', () => {
//   const AB_IN = parseUnits('1', WETH_MAINNET.decimals).toString()
//   const AB_OUT = parseUnits('1000', DAI_MAINNET.decimals).toString()

//   const abIn = CurrencyAmount.fromRawAmount(WETH_MAINNET, AB_IN)
//   const abOut = CurrencyAmount.fromRawAmount(DAI_MAINNET, AB_OUT)

//   describe('[SELL] WETH --> DAI', () => {
//     it('A > B > A SELL return proper price impact', () => {
//       // GIVEN a 1 WETH >> 1000 DAI AB Trade
//       // GIVEN a 1000 DAI >> 0.5 WETH BA Trade
//       const BA_OUT = parseUnits('0.5', WETH_MAINNET.decimals).toString()
//       const baOut = CurrencyAmount.fromRawAmount(WETH_MAINNET, BA_OUT)
//       // THEN we expect price impact to be 25
//       // (1 - 0.5) / 1 / 2 * 100
//       // BUY order = last param TRUE
//       const abaImpact = _calculateAbaPriceImpact(abIn.quotient.toString(), baOut.quotient.toString())
//       expect(abaImpact.toSignificant(2)).toEqual('25')
//     })
//   })

//   describe('[BUY] DAI --> WETH', () => {
//     it('A > B > A BUY returns proper price impact', () => {
//       // GIVEN a 1000 DAI >> 1 WETH BUY AB Trade
//       // GIVEN a 1 WETH >> 800 WETH SELL BA Trade
//       const BA_OUT = parseUnits('800', DAI_MAINNET.decimals).toString()
//       const baOut = CurrencyAmount.fromRawAmount(DAI_MAINNET, BA_OUT)
//       // THEN we expect price impact to be 25
//       // (1000 - 800) / 1000 / 2 * 100 = 10
//       // BUY order = last param FALSE
//       const abaImpact = _calculateAbaPriceImpact(abOut.quotient.toString(), baOut.quotient.toString())
//       expect(abaImpact.toSignificant(2)).toEqual('10')
//     })
//   })
// })

describe('A > B > A Price Impact', () => {
  ABA_CASES.forEach(({ initialValue, finalValue, expectation, description }) => {
    it(description, () => {
      const abaImpact = calculateFallbackPriceImpact(initialValue.toString(), finalValue.toString())
      expect(abaImpact.toSignificant(2)).toEqual(expectation)
    })
  })
})
