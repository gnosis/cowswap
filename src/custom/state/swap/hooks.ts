import useENS from '@src/hooks/useENS'
import { Currency, CurrencyAmount, JSBI, Trade, Token, TokenAmount, Fraction, TradeType } from '@uniswap/sdk'
import { ParsedQs } from 'qs'
import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useActiveWeb3React } from '@src/hooks'
import { useCurrency } from '@src/hooks/Tokens'
import { useTradeExactIn, useTradeExactOut } from '@src/hooks/Trades'
import useParsedQueryString from '@src/hooks/useParsedQueryString'
import { basisPointsToPercent, isAddress } from '@src/utils'
import { AppDispatch } from 'state'
import { useCurrencyBalances } from '@src/state/wallet/hooks'
import { Field, replaceSwapState } from '@src/state/swap/actions'
import { SwapState } from '@src/state/swap/reducer'
import { useUserSlippageTolerance } from '@src/state/user/hooks'
import { computeSlippageAdjustedAmounts } from '@src/utils/prices'
import { tryParseAmount, useSwapState } from '@src/state/swap/hooks'
import { useFee } from '../fee/hooks'
import { FeeInformation } from '../fee/reducer'
import { BIG_INT_ZERO } from '@src/constants'
import { proxify } from '@src/custom/utils/misc'

export * from '@src/state/swap/hooks'

const isValidTrade = (trade: Trade | null) => !!(trade?.inputAmount && trade?.outputAmount)
const proxyAndValidateTrade = (trade: Trade | null, handler: ProxyHandler<Trade>) => {
  const proxiedTrade = proxify(trade, handler)

  return isValidTrade(proxiedTrade) ? proxiedTrade : null
}

const feeApplicationHandler = ({
  parsedAmountWithFees
}: {
  parsedAmount?: CurrencyAmount
  parsedAmountWithFees?: CurrencyAmount
}): ProxyHandler<Trade> => ({
  get(target, property: keyof Trade) {
    const tradeType = target['tradeType']
    const value = target[property]
    switch (property) {
      case 'inputAmount': {
        return tradeType === TradeType.EXACT_INPUT ? value : parsedAmountWithFees
      }
      case 'outputAmount': {
        return tradeType === TradeType.EXACT_OUTPUT ? value : parsedAmountWithFees
      }
      default: {
        if (typeof value === 'function') return value.bind(target)

        return value
      }
    }
  }
})

function tryValueToCurrency(value?: string, currency?: Currency): CurrencyAmount | undefined {
  if (!value || !currency) {
    return undefined
  }
  try {
    if (value !== '0') {
      return currency instanceof Token ? new TokenAmount(currency, value) : CurrencyAmount.ether(value)
    }
  } catch (error) {
    // should fail if the user specifies too many decimal places of precision (or maybe exceed max uint?)
    console.debug(`Failed to parse input amount: "${value}"`, error)
  }
  // necessary for all paths to return a value
  return undefined
}

interface TradeCalculation {
  inputCurrency?: Currency | null
  outputCurrency?: Currency | null
  parsedAmount?: CurrencyAmount
  isExactIn: boolean
}

function calculateFee({
  feeInformation,
  parsedAmount,
  inputCurrency
}: Pick<TradeCalculation, 'inputCurrency' | 'parsedAmount'> & { feeInformation?: FeeInformation }) {
  const minimalFee = feeInformation?.minimalFee ? new Fraction(feeInformation.minimalFee) : null
  const feeRatio = feeInformation?.feeRatio ? basisPointsToPercent(feeInformation.feeRatio) : null
  const computedFee = feeRatio && parsedAmount ? feeRatio.multiply(parsedAmount) : null

  // Which is greater? MinimalFee or the feeRatio applied to the sellVolume?
  // (100 - feeRatio) * sellVolume
  const fee = computedFee && minimalFee && (computedFee.greaterThan(minimalFee) ? computedFee : minimalFee)

  const parsedFeeAmount = fee
    ? tryParseAmount(fee.toSignificant(inputCurrency?.decimals || 18), inputCurrency || undefined)
    : null

  return parsedFeeAmount
}

const applyFee = ({
  trade,
  feeInformation,
  inputCurrency,
  parsedAmount,
  isExactIn
}: {
  trade: Trade | null
  feeInformation?: FeeInformation | null
  inputCurrency?: Currency | null
  parsedAmount?: CurrencyAmount
  isExactIn: boolean
}) => {
  if (!trade) return undefined

  // NO returned fee info for input token
  if (!feeInformation) return isExactIn ? trade.inputAmount : trade.outputAmount

  const feeAmount = calculateFee({
    feeInformation,
    inputCurrency,
    parsedAmount: isExactIn ? parsedAmount : trade.inputAmount
  })

  if (!feeAmount) return isExactIn ? trade.inputAmount : trade.outputAmount

  let amount: CurrencyAmount, mathsMethod: 'add' | 'subtract'
  if (isExactIn) {
    amount = trade.outputAmount
    mathsMethod = 'subtract'
  } else {
    amount = trade.inputAmount
    mathsMethod = 'add'
  }

  const price = trade.executionPrice.adjusted
  const feeAsOut = isExactIn
    ? // Calculate the fee as: (FEE * EXECUTION_PRICE) and format at output token
      tryParseAmount(feeAmount.multiply(price).toFixed(amount.currency.decimals), amount.currency)
    : // Else, just use fee amount as it is already in sellToken form
      feeAmount

  // depending on trade type (IN/OUT) add or subtract the input amount against the computed fee amt
  const computedFee = feeAsOut ? JSBI[mathsMethod](amount.raw, feeAsOut.raw) : null
  const adjustedPrice = computedFee ? tryValueToCurrency(computedFee.toString(), amount.currency) : null

  if (!adjustedPrice || JSBI.lessThanOrEqual(adjustedPrice.raw, BIG_INT_ZERO)) return undefined

  return adjustedPrice
}

interface DerivedSwapInfo {
  currencies: { [field in Field]?: Currency }
  currencyBalances: { [field in Field]?: CurrencyAmount }
  parsedAmount: CurrencyAmount | undefined
  v2Trade: Trade | undefined
  // TODO: review this - we don't use a v1 trade but changing all code
  // or extending whole swap comp for only removing v1trade is a lot
  v1Trade: undefined
  inputError?: string
}

// from the current swap inputs, compute the best trade and return it.
export function useDerivedSwapInfo(): DerivedSwapInfo {
  const { account } = useActiveWeb3React()

  const {
    independentField,
    typedValue,
    [Field.INPUT]: { currencyId: inputCurrencyId },
    [Field.OUTPUT]: { currencyId: outputCurrencyId },
    recipient
  } = useSwapState()

  const inputCurrency = useCurrency(inputCurrencyId)
  const outputCurrency = useCurrency(outputCurrencyId)
  const recipientLookup = useENS(recipient ?? undefined)
  const to: string | null = (recipient === null ? account : recipientLookup.address) ?? null

  const relevantTokenBalances = useCurrencyBalances(account ?? undefined, [
    inputCurrency ?? undefined,
    outputCurrency ?? undefined
  ])

  const isExactIn: boolean = independentField === Field.INPUT
  const parsedAmount = tryParseAmount(typedValue, (isExactIn ? inputCurrency : outputCurrency) ?? undefined)

  const bestTradeExactIn = useTradeExactIn(isExactIn ? parsedAmount : undefined, outputCurrency ?? undefined)
  const bestTradeExactOut = useTradeExactOut(inputCurrency ?? undefined, !isExactIn ? parsedAmount : undefined)

  const tradeBeforeFees = isExactIn ? bestTradeExactIn : bestTradeExactOut

  const feeInformation = useFee(inputCurrencyId)
  const appliedFees = applyFee({
    trade: tradeBeforeFees,
    feeInformation,
    inputCurrency,
    parsedAmount,
    isExactIn
  })

  // Proxy trade object and intercept in/outputAmount calls
  const v2Trade = proxyAndValidateTrade(tradeBeforeFees, feeApplicationHandler({ parsedAmountWithFees: appliedFees }))

  const currencyBalances = {
    [Field.INPUT]: relevantTokenBalances[0],
    [Field.OUTPUT]: relevantTokenBalances[1]
  }

  const currencies: { [field in Field]?: Currency } = {
    [Field.INPUT]: inputCurrency ?? undefined,
    [Field.OUTPUT]: outputCurrency ?? undefined
  }

  let inputError: string | undefined
  if (!account) {
    inputError = 'Connect Wallet'
  }

  if (!parsedAmount) {
    inputError = inputError ?? 'Enter an amount'
  }

  if (!currencies[Field.INPUT] || !currencies[Field.OUTPUT]) {
    inputError = inputError ?? 'Select a token'
  }

  const formattedTo = isAddress(to)
  if (!to || !formattedTo) {
    inputError = inputError ?? 'Enter a recipient'
  }

  const [allowedSlippage] = useUserSlippageTolerance()

  const slippageAdjustedAmounts = v2Trade && allowedSlippage && computeSlippageAdjustedAmounts(v2Trade, allowedSlippage)

  // compare input balance to max input based on version
  const [balanceIn, amountIn] = [
    currencyBalances[Field.INPUT],
    slippageAdjustedAmounts ? slippageAdjustedAmounts[Field.INPUT] : null
  ]

  if (balanceIn && amountIn && balanceIn.lessThan(amountIn)) {
    inputError = 'Insufficient ' + amountIn.currency.symbol + ' balance'
  }

  return {
    currencies,
    currencyBalances,
    parsedAmount,
    v2Trade: v2Trade ?? undefined,
    inputError,
    v1Trade: undefined
  }
}

function parseCurrencyFromURLParameter(urlParam: any): string {
  if (typeof urlParam === 'string') {
    const valid = isAddress(urlParam)
    if (valid) return valid
    if (urlParam.toUpperCase() === 'ETH') return 'ETH'
    if (valid === false) return 'ETH'
  }
  return 'ETH' ?? ''
}

function parseTokenAmountURLParameter(urlParam: any): string {
  return typeof urlParam === 'string' && !isNaN(parseFloat(urlParam)) ? urlParam : ''
}

function parseIndependentFieldURLParameter(urlParam: any): Field {
  return typeof urlParam === 'string' && urlParam.toLowerCase() === 'output' ? Field.OUTPUT : Field.INPUT
}

const ENS_NAME_REGEX = /^[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)?$/
const ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/
function validatedRecipient(recipient: any): string | null {
  if (typeof recipient !== 'string') return null
  const address = isAddress(recipient)
  if (address) return address
  if (ENS_NAME_REGEX.test(recipient)) return recipient
  if (ADDRESS_REGEX.test(recipient)) return recipient
  return null
}

export function queryParametersToSwapState(parsedQs: ParsedQs): SwapState {
  let inputCurrency = parseCurrencyFromURLParameter(parsedQs.inputCurrency)
  let outputCurrency = parseCurrencyFromURLParameter(parsedQs.outputCurrency)
  if (inputCurrency === outputCurrency) {
    if (typeof parsedQs.outputCurrency === 'string') {
      inputCurrency = ''
    } else {
      outputCurrency = ''
    }
  }

  const recipient = validatedRecipient(parsedQs.recipient)

  return {
    [Field.INPUT]: {
      currencyId: inputCurrency
    },
    [Field.OUTPUT]: {
      currencyId: outputCurrency
    },
    typedValue: parseTokenAmountURLParameter(parsedQs.exactAmount),
    independentField: parseIndependentFieldURLParameter(parsedQs.exactField),
    recipient
  }
}

// updates the swap state to use the defaults for a given network
export function useDefaultsFromURLSearch():
  | { inputCurrencyId: string | undefined; outputCurrencyId: string | undefined }
  | undefined {
  const { chainId } = useActiveWeb3React()
  const dispatch = useDispatch<AppDispatch>()
  const parsedQs = useParsedQueryString()
  const [result, setResult] = useState<
    { inputCurrencyId: string | undefined; outputCurrencyId: string | undefined } | undefined
  >()

  useEffect(() => {
    if (!chainId) return
    const parsed = queryParametersToSwapState(parsedQs)

    dispatch(
      replaceSwapState({
        typedValue: parsed.typedValue,
        field: parsed.independentField,
        inputCurrencyId: parsed[Field.INPUT].currencyId,
        outputCurrencyId: parsed[Field.OUTPUT].currencyId,
        recipient: parsed.recipient
      })
    )

    setResult({ inputCurrencyId: parsed[Field.INPUT].currencyId, outputCurrencyId: parsed[Field.OUTPUT].currencyId })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, chainId])

  return result
}
