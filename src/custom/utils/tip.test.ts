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

// const fiveMinutesFromNow = () => new Date(Date.now() + 300000).toISOString()
// try to parse a user entered amount for a given token

// had to rebuild here as import was failing...
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

const DEFAULT_HOPS = { maxHops: 3, maxNumResults: 1 }

interface SetupTrade {
  type: TradeType
  fee: Partial<FeeInformation>
  typedAmount: string
  inputCurrency: Currency
  outputCurrency: Currency
  pair: Pair
}

function setupTrade(
  props: SetupTrade
):
  | (SetupTrade & {
      trade: Trade & {
        inputAmountWithFees?: CurrencyAmount
      }
      typedAmountAsCurrency?: CurrencyAmount
      feeAsCurrency?: CurrencyAmount
    })
  | null {
  const {
    type,
    fee: { minimalFee = '10' },
    typedAmount,
    inputCurrency,
    outputCurrency,
    pair
  } = props

  // Trade type: IN // OUT
  const isExactIn = type === TradeType.EXACT_INPUT

  // Amounts in Currency form
  const typedAmountAsCurrency = tryParseAmount(typedAmount, isExactIn ? inputCurrency : outputCurrency)
  const feeAsCurrency = tryParseAmount(minimalFee, inputCurrency)

  // Type checks mainly
  if (!typedAmountAsCurrency || !pair || !feeAsCurrency) return null

  // Calculate IN // OUT trades
  let trade: Trade & {
    inputAmountWithFees?: CurrencyAmount
  }
  if (isExactIn) {
    // subtract fee from typed in amount
    const typedAmountWithFees = typedAmountAsCurrency.subtract(feeAsCurrency)
    const preTrade =
      // This is how Uni calculates trades in their hook and in Trades.ts
      Trade.bestTradeExactIn(
        [pair1and2],
        // subtract fee from typed in amount
        typedAmountWithFees,
        outputCurrency,
        DEFAULT_HOPS
        // Yes, this is also copy/paste
      )[0] ?? null

    // We need to iverride the Trade object to use different values as we are intercepting initial inputs
    // and applying fee. For ExactIn orders, we leave outputAmount as is
    // and only change inputAmount to show the original entry before fee calculation
    trade = {
      ...preTrade,
      get inputAmount() {
        return typedAmountAsCurrency!
      },
      get minimumAmountOut() {
        return this.minimumAmountOut
      },
      get maximumAmountIn() {
        return this.maximumAmountIn
      },
      inputAmountWithFees: typedAmountWithFees
    }
  } else {
    // This is how Uni calculates trades in their hook and in Trades.ts
    // Yes, the ?? null is also copy/paste
    const preTrade = Trade.bestTradeExactOut([pair1and2], inputCurrency, typedAmountAsCurrency, DEFAULT_HOPS)[0] ?? null

    const inputAmountWithFee = preTrade.inputAmount!.add(feeAsCurrency!)
    // We need to iverride the Trade object to use different values as we are intercepting initial inputs
    // and applying fee. For ExactOut orders, we leave inputAmount as is
    // and only change outputAm to show the original entry before fee calculation
    trade = {
      ...preTrade,
      inputAmount: inputAmountWithFee,
      get minimumAmountOut() {
        return this.minimumAmountOut
      },
      get maximumAmountIn() {
        return this.maximumAmountIn
      }
    }
  }

  return {
    ...props,
    trade,
    typedAmountAsCurrency,
    feeAsCurrency
  }
}

// CONFIG
const typedAmount = (Math.random() * 9382).toString()
const minimalFee = (Math.random() * 100).toString()

describe('prices', () => {
  describe('computeTradePriceBreakdown', () => {
    // Temp test variables
    let exactInOutputAmount: CurrencyAmount

    it(`EXACT-IN TRADE: ${minimalFee} minimalFee - selling ${typedAmount}`, () => {
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

      const { inputCurrency, outputCurrency, fee: feeInformation, typedAmountAsCurrency, trade } = tradeData

      const expectedOutput = typedAmountAsCurrency?.subtract(tryParseAmount(minimalFee, inputCurrency)!).toExact()
      // Expect inputAmount MINUS FEE e.g 20(input) - 10(fee)
      const expectedInputAmountAfterFeeCalc = tryParseAmount(expectedOutput, inputCurrency)

      // GP OPERATOR TIP/FEES
      console.log(`
      =======> EXACT IN TRADE (SELL) <=======
      =======> PRE-CALCULATION PARAMETERS:
      TYPED IN EXPECTED TO [SELL] AMOUNT:: ${typedAmount}
      ==========================================================
      [IN] TRADE INPUT CURRENCY:: ${trade.inputAmount.currency.symbol}
      [IN] TRADE INPUT AMOUNT:: ${trade.inputAmount.toExact()} of ${inputCurrency.symbol}
      [IN] TRADE OUTPUT CURRENCY:: ${trade.outputAmount.currency.symbol}
      [IN] TRADE OUTPUT AMOUNT:: ${trade.outputAmount.toExact()} of ${outputCurrency.symbol}
      ===========================================================
      FEE INFORMATION:: ${feeInformation.minimalFee}
      SELL AMOUNT BEFORE FEE:: ${typedAmountAsCurrency!.toExact()}
      SELL AMOUNT AFTER FEE:: ${trade.inputAmountWithFees?.toExact()}
      BUY AMOUNT BEFORE FEE:: ${trade.outputAmount.toExact()}
      BUY AMOUNT AFTER FEE:: ${/* expectedOtherAmount!.toExact() */ ''}
      PRICE:: ${trade.executionPrice.toSignificant(6)}`)

      exactInOutputAmount = trade.outputAmount

      // Expect inputAmount, despite fee calculations, to be the initial amount of 20
      expect(trade.inputAmount.toExact()).toEqual(typedAmountAsCurrency?.toExact())
      // However, expect output amount to be calculation of trade using adjusted inputAMountWithFee of 20 - 10
      expect(trade.outputAmount.toExact()).toEqual(
        Trade.bestTradeExactIn(
          [pair1and2],
          expectedInputAmountAfterFeeCalc!,
          token2,
          DEFAULT_HOPS
        )[0]?.outputAmount?.toExact()
      )
    })

    it(`EXACT-OUT TRADE: ${minimalFee} minimalFee - BUY`, () => {
      // use the returns value from test above (sell) or fallback to default typedAmount
      const exactOutTypedAmount = exactInOutputAmount?.toExact() || typedAmount

      const tradeData = setupTrade({
        type: TradeType.EXACT_OUTPUT,
        typedAmount: exactOutTypedAmount,
        fee: {
          minimalFee
        },
        inputCurrency: token1,
        outputCurrency: token2,
        pair: pair1and2
      })

      if (!tradeData?.trade) throw new Error('Test failed::Trade returned NULL')

      const { inputCurrency, outputCurrency, fee: feeInformation, typedAmountAsCurrency, trade } = tradeData

      const minimalFeeAsCurrency = tryParseAmount(minimalFee, trade.inputAmount.currency)
      // const expectedInput = trade.inputAmount.add(minimalFeeAsCurrency!).toExact()
      // const expectedInputAmountAfterFeeCalc = tryParseAmount(expectedOutput, inputCurrency)

      // GP OPERATOR TIP/FEES
      console.log(`
      =======> EXACT OUT TRADE (BUY) <=======
      =======> PRE-CALCULATION PARAMETERS:
      TYPED IN EXPECTED TO [BUY] AMOUNT:: ${exactOutTypedAmount}
      ==========================================================
      [OUT] TRADE INPUT CURRENCY:: ${trade.inputAmount.currency.symbol}
      [OUT] TRADE INPUT AMOUNT:: ${trade.inputAmount.toExact()} of ${inputCurrency.symbol}
      [OUT] TRADE OUTPUT CURRENCY:: ${trade.outputAmount.currency.symbol}
      [OUT] TRADE OUTPUT AMOUNT:: ${trade.outputAmount.toExact()}  of ${outputCurrency.symbol}
      ===========================================================
      FEE INFORMATION:: ${feeInformation.minimalFee}
      BUY AMOUNT BEFORE FEE:: ${typedAmountAsCurrency!.toExact()}
      BUY AMOUNT AFTER FEE:: ${/* actualTypedAmount!.toExact() */ ''}
      SELL AMOUNT BEFORE FEE:: ${trade.outputAmount.toExact()}
      SELL AMOUNT AFTER FEE:: ${/* expectedOtherAmount!.toExact() */ ''}
      PRICE:: ${trade.executionPrice.toSignificant(6)}`)

      expect(trade.inputAmount?.toExact()).toEqual(
        Trade.bestTradeExactOut([pair1and2], token1, exactInOutputAmount!, DEFAULT_HOPS)[0]
          ?.inputAmount?.add(minimalFeeAsCurrency!)
          .toExact()
      )
    })
  })
})
