/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { FeeInformation } from '@src/custom/utils/operator'
import {
  ChainId,
  Currency,
  CurrencyAmount,
  JSBI,
  Pair,
  Route,
  Token,
  TokenAmount,
  Trade,
  TradeType
} from '@uniswap/sdk'
import { parseUnits } from 'ethers/lib/utils'
import { computeTradePriceBreakdown } from '../../utils/prices'

const fiveMinutesFromNow = () => new Date(Date.now() + 300000).toISOString()
// try to parse a user entered amount for a given token
function tryParseAmount(value?: string, currency?: Currency): CurrencyAmount | undefined {
  if (!value || !currency) {
    return undefined
  }
  try {
    const typedValueParsed = parseUnits(value, currency.decimals).toString()
    if (typedValueParsed !== '0') {
      return currency instanceof Token
        ? new TokenAmount(currency, JSBI.BigInt(typedValueParsed))
        : CurrencyAmount.ether(JSBI.BigInt(typedValueParsed))
    }
  } catch (error) {
    // should fail if the user specifies too many decimal places of precision (or maybe exceed max uint?)
    console.debug(`Failed to parse input amount: "${value}"`, error)
  }
  // necessary for all paths to return a value
  return undefined
}

const token1 = new Token(ChainId.MAINNET, '0x0000000000000000000000000000000000000001', 18, 'TOK_ONE')
const token2 = new Token(ChainId.MAINNET, '0x0000000000000000000000000000000000000002', 18, 'TOK_TWO')
const token3 = new Token(ChainId.MAINNET, '0x0000000000000000000000000000000000000003', 18, 'TOK_THREE')

const pair1and2 = new Pair(
  new TokenAmount(token1, JSBI.BigInt(100000 * 10 ** 18)),
  new TokenAmount(token2, JSBI.BigInt(100000 * 10 ** 18))
)
const pair2and3 = new Pair(
  new TokenAmount(token2, JSBI.BigInt(200000 * 10 ** 18)),
  new TokenAmount(token3, JSBI.BigInt(300000 * 10 ** 18))
)

interface SetupTrade {
  type: TradeType
  fee: Partial<FeeInformation>
  typedAmount: string
  inputCurrency: Currency
  outputCurrency: Currency
  pair: Pair
}

function calculateExactInTrade({
  feeAsCurrency,
  typedAmountAsCurrency,
  pair,
  outputCurrency
}: Required<Pick<SetupTrade, 'pair' | 'outputCurrency'>> & {
  feeAsCurrency: CurrencyAmount
  typedAmountAsCurrency: CurrencyAmount
}) {
  // User types in 20, FEE = 10, actual typedAmount = 10
  const actualTypedAmount = typedAmountAsCurrency.subtract(feeAsCurrency)

  const trade =
    Trade.bestTradeExactIn([pair], actualTypedAmount as CurrencyAmount, outputCurrency, {
      maxHops: 3,
      maxNumResults: 1
    })[0] ?? null

  return { trade, actualTypedAmount, expectedOtherAmount: actualTypedAmount }
}

function calculateExactOutTrade({
  feeAsCurrency,
  typedAmountAsCurrency,
  pair,
  outputCurrency
}: Required<Pick<SetupTrade, 'pair' | 'outputCurrency'>> & {
  feeAsCurrency: CurrencyAmount
  typedAmountAsCurrency: CurrencyAmount
}) {
  console.log('FEE AS CURRENCY::', feeAsCurrency)

  const trade =
    Trade.bestTradeExactOut([pair], outputCurrency, typedAmountAsCurrency as CurrencyAmount, {
      maxHops: 3,
      maxNumResults: 1
    })[0] ?? null

  return { trade, actualTypedAmount: typedAmountAsCurrency, expectedOtherAmount: trade.outputAmount.add(feeAsCurrency) }
}

function setupTrade(
  props: SetupTrade
):
  | (SetupTrade & {
      trade: Trade
      typedAmountAsCurrency?: CurrencyAmount
      feeAsCurrency?: CurrencyAmount
      actualTypedAmount?: CurrencyAmount
      expectedOtherAmount?: CurrencyAmount
    })
  | null {
  const {
    type,
    fee: { expirationDate = fiveMinutesFromNow(), minimalFee = '10', feeRatio = 10 },
    typedAmount = '20',
    inputCurrency = token1,
    outputCurrency = token2,
    pair
  } = props

  console.log('EXPIRATION_DATE::', expirationDate)
  console.log('FEE_RATIO::', feeRatio)

  // Trade type: IN // OUT
  const isExactIn = type === TradeType.EXACT_INPUT

  // Amounts in Currency form
  const typedAmountAsCurrency = tryParseAmount(typedAmount, inputCurrency)
  const feeAsCurrency = tryParseAmount(minimalFee, inputCurrency)

  // Type checks mainly
  if (!typedAmountAsCurrency || !pair || !feeAsCurrency) return null

  // Calculate IN // OUT trades
  const { trade, actualTypedAmount, expectedOtherAmount } = isExactIn
    ? calculateExactInTrade({
        typedAmountAsCurrency,
        pair,
        feeAsCurrency,
        outputCurrency
      })
    : calculateExactOutTrade({
        typedAmountAsCurrency,
        pair,
        feeAsCurrency,
        outputCurrency
      })

  return {
    ...props,
    trade,
    typedAmountAsCurrency,
    feeAsCurrency,
    actualTypedAmount,
    expectedOtherAmount
  }
}

describe('prices', () => {
  describe('computeTradePriceBreakdown', () => {
    // Temp test variables
    let exactInOutputAmount: CurrencyAmount

    xit('returns undefined for undefined', () => {
      expect(computeTradePriceBreakdown(undefined)).toEqual({
        priceImpactWithoutFee: undefined,
        realizedLPFee: undefined
      })
    })

    it('EXACT-IN TRADE: 10 minimalFee - selling 20', () => {
      const typedAmount = '20'
      const minimalFee = '10'
      const expectedOutput = '10'

      const tradeData = setupTrade({
        type: TradeType.EXACT_INPUT,
        typedAmount,
        fee: {
          minimalFee
        },
        inputCurrency: token1,
        outputCurrency: token2,
        pair: pair1and2
      })

      if (!tradeData?.trade) throw new Error('Test failed::Trade returned NULL')

      const {
        inputCurrency,
        fee: feeInformation,
        typedAmountAsCurrency,
        actualTypedAmount,
        trade,
        expectedOtherAmount
      } = tradeData

      // Expect inputAmount MINUS FEE e.g 20(input) - 10(fee)
      const expectedInputAmountAfterFeeCalc = tryParseAmount(expectedOutput, inputCurrency)

      // GP OPERATOR TIP/FEES
      //   console.log('PARSED AMOUNT::', parsedAmount.toExact())
      console.log(`
      =======> EXACT OUT TRADE (SELL) <=======
      =======> PRE-CALCULATION PARAMETERS:
      TYPED IN EXPECTED TO [SELL] AMOUNT:: ${typedAmount}
      ==========================================================
      [IN] TRADE INPUT CURRENCY:: ${trade.inputAmount.currency.symbol}
      [IN] TRADE INPUT AMOUNT:: ${trade.inputAmount.toExact()}
      [IN] TRADE OUTPUT CURRENCY:: ${trade.outputAmount.currency.symbol}
      [IN] TRADE OUTPUT AMOUNT:: ${trade.outputAmount.toExact()}
      ===========================================================
      FEE INFORMATION:: ${feeInformation.minimalFee}
      SELL AMOUNT BEFORE FEE:: ${typedAmountAsCurrency!.toExact()}
      SELL AMOUNT AFTER FEE:: ${actualTypedAmount!.toExact()}
      BUY AMOUNT BEFORE FEE:: ${trade.inputAmount.toExact()}
      BUY AMOUNT AFTER FEE:: ${expectedOtherAmount!.toExact()}
      PRICE:: ${trade.executionPrice.toSignificant(6)}`)

      exactInOutputAmount = trade.outputAmount

      // Expect 10 as input amount after initially entering 20 and fee = 10
      expect(exactInOutputAmount.toExact()).toEqual(expectedInputAmountAfterFeeCalc?.toExact())
    })

    it('EXACT-OUT TRADE: 10 minimalFee - buying 20', () => {
      const typedAmount = exactInOutputAmount.toExact()
      const minimalFee = '10'

      const tradeData = setupTrade({
        type: TradeType.EXACT_OUTPUT,
        typedAmount,
        fee: {
          minimalFee
        },
        inputCurrency: token2,
        outputCurrency: token1,
        pair: new Pair(
          new TokenAmount(token2, JSBI.BigInt(100000 * 10 ** 18)),
          new TokenAmount(token1, JSBI.BigInt(100000 * 10 ** 18))
        )
      })

      if (!tradeData) throw new Error('Test failed::Trade returned NULL')

      const minimalFeeAsCurrency = tryParseAmount(minimalFee, tradeData?.trade.outputAmount.currency)
      const expectedOutput = exactInOutputAmount.add(minimalFeeAsCurrency!).toExact()

      const {
        inputCurrency,
        fee: feeInformation,
        typedAmountAsCurrency,
        actualTypedAmount,
        trade,
        expectedOtherAmount
      } = tradeData

      const expectedInputAmountAfterFeeCalc = tryParseAmount(expectedOutput, inputCurrency)

      // GP OPERATOR TIP/FEES
      //   console.log('PARSED AMOUNT::', parsedAmount.toExact())
      console.log(`
      =======> EXACT OUT TRADE (BUY) <=======
      =======> PRE-CALCULATION PARAMETERS:
      TYPED IN EXPECTED TO [BUY] AMOUNT:: ${typedAmount}
      ==========================================================
      [OUT] TRADE INPUT CURRENCY:: ${trade.inputAmount.currency.symbol}
      [OUT] TRADE INPUT AMOUNT:: ${trade.inputAmount.toExact()}
      [OUT] TRADE OUTPUT CURRENCY:: ${trade.outputAmount.currency.symbol}
      [OUT] TRADE OUTPUT AMOUNT:: ${trade.outputAmount.toExact()}
      ===========================================================
      FEE INFORMATION:: ${feeInformation.minimalFee}
      BUY AMOUNT BEFORE FEE:: ${typedAmountAsCurrency!.toExact()}
      BUY AMOUNT AFTER FEE:: ${actualTypedAmount!.toExact()}
      SELL AMOUNT BEFORE FEE:: ${trade.outputAmount.toExact()}
      SELL AMOUNT AFTER FEE:: ${expectedOtherAmount!.toExact()}
      PRICE:: ${trade.executionPrice.toSignificant(6)}`)

      // Expect 10 as input amount after initially entering 20 and fee = 10
      expect(expectedOtherAmount?.toExact()).toEqual(expectedInputAmountAfterFeeCalc?.toExact())
    })
    /**
     * // UNI LP FEES
     // Check trade hops and liquidity provider fees match up
      console.log(computeTradePriceBreakdown(trade).realizedLPFee?.toExact())
      console.log(new TokenAmount(token1, JSBI.BigInt(6 * 10 ** 16)).toExact())
      expect(computeTradePriceBreakdown(trade).realizedLPFee).toEqual(
        new TokenAmount(token1, JSBI.BigInt(6 * 10 ** 16))
      )
 */
    xit('correct realized lp fee for double hop', () => {
      expect(
        computeTradePriceBreakdown(
          new Trade(
            new Route([pair1and2, pair2and3], token1),
            new TokenAmount(token1, JSBI.BigInt(1000)),
            TradeType.EXACT_INPUT
          )
        ).realizedLPFee
      ).toEqual(new TokenAmount(token1, JSBI.BigInt(5)))
    })
  })
})
