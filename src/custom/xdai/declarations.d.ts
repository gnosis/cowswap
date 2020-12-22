import {
  Currency,
  CurrencyAmount,
  BigintIsh,
  Price,
  TradeType,
  Percent,
  BestTradeOptions,
  TradeOptions,
  TradeOptionsDeadline,
  SwapParameters
} from '@uniswap/sdk'
import { ChainId } from './'

declare module '@uniswap/sdk' {
  export class Token extends Currency {
    readonly chainId: ChainId
    readonly address: string
    constructor(chainId: ChainId, address: string, decimals: number, symbol?: string, name?: string)
    /**
     * Returns true if the two tokens are equivalent, i.e. have the same chainId and address.
     * @param other other token to compare
     */
    equals(other: Token): boolean
    /**
     * Returns true if the address of this token sorts before the address of the other token
     * @param other other token to compare
     * @throws if the tokens have the same address
     * @throws if the tokens are on different chains
     */
    sortsBefore(other: Token): boolean
  }

  export class TokenAmount extends CurrencyAmount {
    readonly token: Token
    constructor(token: Token, amount: BigintIsh)
    add(other: TokenAmount): TokenAmount
    subtract(other: TokenAmount): TokenAmount
  }

  export class Pair {
    readonly liquidityToken: Token
    private readonly tokenAmounts
    static getAddress(tokenA: Token, tokenB: Token): string
    constructor(tokenAmountA: TokenAmount, tokenAmountB: TokenAmount)
    /**
     * Returns true if the token is either token0 or token1
     * @param token to check
     */
    involvesToken(token: Token): boolean
    /**
     * Returns the current mid price of the pair in terms of token0, i.e. the ratio of reserve1 to reserve0
     */
    get token0Price(): Price
    /**
     * Returns the current mid price of the pair in terms of token1, i.e. the ratio of reserve0 to reserve1
     */
    get token1Price(): Price
    /**
     * Return the price of the given token in terms of the other token in the pair.
     * @param token token to return price of
     */
    priceOf(token: Token): Price
    /**
     * Returns the chain ID of the tokens in the pair.
     */
    get chainId(): ChainId
    get token0(): Token
    get token1(): Token
    get reserve0(): TokenAmount
    get reserve1(): TokenAmount
    reserveOf(token: Token): TokenAmount
    getOutputAmount(inputAmount: TokenAmount): [TokenAmount, Pair]
    getInputAmount(outputAmount: TokenAmount): [TokenAmount, Pair]
    getLiquidityMinted(totalSupply: TokenAmount, tokenAmountA: TokenAmount, tokenAmountB: TokenAmount): TokenAmount
    getLiquidityValue(
      token: Token,
      totalSupply: TokenAmount,
      liquidity: TokenAmount,
      feeOn?: boolean,
      kLast?: BigintIsh
    ): TokenAmount
  }

  export class Route {
    readonly pairs: Pair[]
    readonly path: Token[]
    readonly input: Currency
    readonly output: Currency
    readonly midPrice: Price
    constructor(pairs: Pair[], input: Currency, output?: Currency)
    get chainId(): ChainId
  }

  /**
   * Represents a trade executed against a list of pairs.
   * Does not account for slippage, i.e. trades that front run this trade and move the price.
   */
  export class Trade {
    /**
     * The route of the trade, i.e. which pairs the trade goes through.
     */
    readonly route: Route
    /**
     * The type of the trade, either exact in or exact out.
     */
    readonly tradeType: TradeType
    /**
     * The input amount for the trade assuming no slippage.
     */
    readonly inputAmount: CurrencyAmount
    /**
     * The output amount for the trade assuming no slippage.
     */
    readonly outputAmount: CurrencyAmount
    /**
     * The price expressed in terms of output amount/input amount.
     */
    readonly executionPrice: Price
    /**
     * The mid price after the trade executes assuming no slippage.
     */
    readonly nextMidPrice: Price
    /**
     * The percent difference between the mid price before the trade and the trade execution price.
     */
    readonly priceImpact: Percent
    /**
     * Constructs an exact in trade with the given amount in and route
     * @param route route of the exact in trade
     * @param amountIn the amount being passed in
     */
    static exactIn(route: Route, amountIn: CurrencyAmount): Trade
    /**
     * Constructs an exact out trade with the given amount out and route
     * @param route route of the exact out trade
     * @param amountOut the amount returned by the trade
     */
    static exactOut(route: Route, amountOut: CurrencyAmount): Trade
    constructor(route: Route, amount: CurrencyAmount, tradeType: TradeType)
    /**
     * Get the minimum amount that must be received from this trade for the given slippage tolerance
     * @param slippageTolerance tolerance of unfavorable slippage from the execution price of this trade
     */
    minimumAmountOut(slippageTolerance: Percent): CurrencyAmount
    /**
     * Get the maximum amount in that can be spent via this trade for the given slippage tolerance
     * @param slippageTolerance tolerance of unfavorable slippage from the execution price of this trade
     */
    maximumAmountIn(slippageTolerance: Percent): CurrencyAmount
    /**
     * Given a list of pairs, and a fixed amount in, returns the top `maxNumResults` trades that go from an input token
     * amount to an output token, making at most `maxHops` hops.
     * Note this does not consider aggregation, as routes are linear. It's possible a better route exists by splitting
     * the amount in among multiple routes.
     * @param pairs the pairs to consider in finding the best trade
     * @param currencyAmountIn exact amount of input currency to spend
     * @param currencyOut the desired currency out
     * @param maxNumResults maximum number of results to return
     * @param maxHops maximum number of hops a returned trade can make, e.g. 1 hop goes through a single pair
     * @param currentPairs used in recursion; the current list of pairs
     * @param originalAmountIn used in recursion; the original value of the currencyAmountIn parameter
     * @param bestTrades used in recursion; the current list of best trades
     */
    static bestTradeExactIn(
      pairs: Pair[],
      currencyAmountIn: CurrencyAmount,
      currencyOut: Currency,
      { maxNumResults, maxHops }?: BestTradeOptions,
      currentPairs?: Pair[],
      originalAmountIn?: CurrencyAmount,
      bestTrades?: Trade[]
    ): Trade[]
    /**
     * similar to the above method but instead targets a fixed output amount
     * given a list of pairs, and a fixed amount out, returns the top `maxNumResults` trades that go from an input token
     * to an output token amount, making at most `maxHops` hops
     * note this does not consider aggregation, as routes are linear. it's possible a better route exists by splitting
     * the amount in among multiple routes.
     * @param pairs the pairs to consider in finding the best trade
     * @param currencyIn the currency to spend
     * @param currencyAmountOut the exact amount of currency out
     * @param maxNumResults maximum number of results to return
     * @param maxHops maximum number of hops a returned trade can make, e.g. 1 hop goes through a single pair
     * @param currentPairs used in recursion; the current list of pairs
     * @param originalAmountOut used in recursion; the original value of the currencyAmountOut parameter
     * @param bestTrades used in recursion; the current list of best trades
     */
    static bestTradeExactOut(
      pairs: Pair[],
      currencyIn: Currency,
      currencyAmountOut: CurrencyAmount,
      { maxNumResults, maxHops }?: BestTradeOptions,
      currentPairs?: Pair[],
      originalAmountOut?: CurrencyAmount,
      bestTrades?: Trade[]
    ): Trade[]
  }

  export abstract class Router {
    /**
     * Cannot be constructed.
     */
    private constructor()
    /**
     * Produces the on-chain method name to call and the hex encoded parameters to pass as arguments for a given trade.
     * @param trade to produce call parameters for
     * @param options options for the call parameters
     */
    static swapCallParameters(trade: Trade, options: TradeOptions | TradeOptionsDeadline): SwapParameters
  }
}
