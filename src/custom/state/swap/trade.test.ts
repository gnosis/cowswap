import { parseUnits } from '@ethersproject/units'
import { getCanonicalMarket } from '@src/custom/utils/misc'
import { getPriceQuote } from '@src/custom/utils/operator'
import { basisPointsToPercent } from '@src/utils'
import { ChainId, Fraction, JSBI, Pair, Route, Token, TokenAmount, Trade, TradeType, WETH } from '@uniswap/sdk'

const WETH_MAINNET = new Token(ChainId.MAINNET, WETH[1].address, 18)
const DAI_MAINNET = new Token(ChainId.MAINNET, '0x6b175474e89094c44da98b954eedeac495271d0f', 18)

const PAIR_WETH_DAI = new Pair(
  new TokenAmount(WETH_MAINNET, JSBI.BigInt(1000000000)),
  new TokenAmount(DAI_MAINNET, JSBI.BigInt(2000000000))
)

describe('Swap PRICE Quote test', () => {
  describe('ExactIn: WETH/DAI_MAINNET', () => {
    let inTrade, quote: any, extendedTradeIn: any

    // 1 WETH SELL
    const amountIn = parseUnits('1').toString()
    const currencyIn = new TokenAmount(WETH_MAINNET, amountIn)

    beforeEach(async () => {
      // make a new Trade object
      inTrade = new Trade(new Route([PAIR_WETH_DAI], WETH_MAINNET), currencyIn, TradeType.EXACT_INPUT)

      const { quoteToken, baseToken } = getCanonicalMarket({
        sellToken: WETH_MAINNET.address,
        buyToken: DAI_MAINNET.address,
        kind: 'sell'
      })

      // get the WETH/DAI quote
      quote = await getPriceQuote({
        chainId: 1,
        quoteToken,
        baseToken,
        amount: amountIn,
        kind: 'sell'
      })

      extendedTradeIn = {
        ...inTrade,
        outputAmount: new TokenAmount(DAI_MAINNET, quote.amount),
        maximumAmountIn: inTrade.maximumAmountIn,
        minimumAmountOut: inTrade.minimumAmountOut
      }
    })

    it('Expect FAIL: ExactIN swap: 0.5% Slippage', async () => {
      // we expect a slippage of (1 - slippage) e.g 1 - 0.005 = 0.995
      const expectedSlippage = new Fraction('995', '1000')
      // let's check against the way Uni calculates it exactly using 0.5% slippage
      const actualSlippage = new Fraction('1').add(basisPointsToPercent(50)).invert()

      // Calculate our expected output
      const expectedOutput = new Fraction(quote.amount).multiply(expectedSlippage)
      // Actual:
      const actualOutput = extendedTradeIn.minimumAmountOut(basisPointsToPercent(50)).raw.toString()

      console.log(
        `
            EXPECTED SLIPPAGE:  ${expectedSlippage.toFixed(12)}
            ACTUAL SLIPPAGE:    ${actualSlippage.toFixed(12)}
          `
      )

      console.log(
        `
            EXPECTED SLIPPAGE OUTPUT:  ${expectedOutput.quotient.toString()}
            ACTUAL SLIPPAGE OUTPUT:    ${actualOutput}
          `
      )

      // slippage expected and actual slippage do not match..
      expect(expectedSlippage.equalTo(actualSlippage)).toBeFalsy()
      // there is a slight mismatch...
      expect(actualOutput).not.toEqual(expectedOutput.quotient.toString())
    })

    it('Expect PASS: ExactIN swap: 0.5% Slippage', async () => {
      // calculate slippage EXACTLY as uni does
      // first we convert basis points slippage 50 (0.005) to Percent
      // then we add to Fraction(1) and INVERT
      const slippagePercent = basisPointsToPercent(50)
      const expectedSlippage = new Fraction('1').add(slippagePercent).invert()

      // multiply our quoted amount by the expectedSlippage
      const expectedOutput = new Fraction(quote.amount).multiply(expectedSlippage)
      // Actual:
      const actualSlippage = extendedTradeIn.minimumAmountOut(slippagePercent).raw.toString()

      expect(actualSlippage).toEqual(expectedOutput.quotient.toString())
    })
  })
})
