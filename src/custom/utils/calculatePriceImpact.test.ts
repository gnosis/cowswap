import { ChainId, WETH } from '@uniswap/sdk'
import { CurrencyAmount, Token, TradeType } from '@uniswap/sdk-core'
import { parseUnits } from 'ethers/lib/utils'
import { calculateFallbackPriceImpact } from './price'

const WETH_MAINNET = new Token(ChainId.MAINNET, WETH[1].address, 18)
const DAI_MAINNET = new Token(ChainId.MAINNET, '0x6b175474e89094c44da98b954eedeac495271d0f', 18)

// const ABA_CASES = [
//   {
//     sellAmount: parseUnits('100', WETH_MAINNET.decimals).toString(),
//     receiveAmount: parseUnits('80', DAI_MAINNET.decimals).toString(),
//     recoveredAmount: parseUnits('56', WETH_MAINNET.decimals).toString(),
//     expectedAmount: '25',
//   },
// ]

describe('A > B > A Price Impact', () => {
  it('SELL return proper price impact', () => {
    // GIVEN a 100 WETH >> 80 DAI AB Trade
    const abInParsed = parseUnits('100', WETH_MAINNET.decimals).toString()
    const abOutParsed = parseUnits('80', DAI_MAINNET.decimals).toString()
    const abIn = CurrencyAmount.fromRawAmount(WETH_MAINNET, abInParsed)
    const abOut = CurrencyAmount.fromRawAmount(DAI_MAINNET, abOutParsed)

    // GIVEN a 80 DAI >> 56 WETH BA Trade
    const baOutParsed = parseUnits('56', WETH_MAINNET.decimals).toString()
    const baOut = CurrencyAmount.fromRawAmount(WETH_MAINNET, baOutParsed)

    // Get IV/MV/FV values
    const initialValue = abIn.quotient.toString()
    const middleValue = abOut.quotient.toString()
    const finalValue = baOut.quotient.toString()

    // THEN we expect price impact to be 25
    // S = 1 - sqrt( 0.8*0.7 ) = 0.2516685226 --> 25%, valid cause is a number between 0 and 1
    const abaImpact = calculateFallbackPriceImpact({
      abTradeType: TradeType.EXACT_INPUT,
      initialValue,
      middleValue,
      finalValue,
    })
    expect(abaImpact.toSignificant(2)).toEqual('25')
  })
  it('A > B > A BUY returns proper price impact', () => {
    // GIVEN a 2978 DAI >> 122 WETH [BUY] AB Trade
    const abInParsed = parseUnits('122', WETH_MAINNET.decimals).toString()
    const abOutParsed = parseUnits('2970', DAI_MAINNET.decimals).toString()
    const abIn = CurrencyAmount.fromRawAmount(WETH_MAINNET, abInParsed)
    const abOut = CurrencyAmount.fromRawAmount(DAI_MAINNET, abOutParsed)

    // GIVEN a 122 WETH >> 2421 DAI [SELL] BA Trade
    const parsedAmount = parseUnits('2400', DAI_MAINNET.decimals).toString()
    const baOut = CurrencyAmount.fromRawAmount(DAI_MAINNET, parsedAmount)

    // Get IV/MV/FV values
    const initialValue = abOut.quotient.toString()
    const middleValue = abIn.quotient.toString()
    const finalValue = baOut.quotient.toString()

    // THEN we expect price impact to be -11
    const abaImpact = calculateFallbackPriceImpact({
      abTradeType: TradeType.EXACT_OUTPUT,
      initialValue,
      middleValue,
      finalValue,
    })
    expect(abaImpact.toSignificant(2)).toEqual('-11')
  })
  /* TODO: use with ABA test cases
  const abaImpact = calculateFallbackPriceImpact({
        abTradeType: TradeType.EXACT_INPUT,
        initialValue: case.sellAmount,
        middleValue: case.receiveAmount,
        finalValue: case.recoveredAmount,
      })
      expect(abaImpact.toSignificant(2)).toEqual(case.expectedAmount)
  */
})
