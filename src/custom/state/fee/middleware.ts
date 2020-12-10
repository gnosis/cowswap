import { isAnyOf, Middleware } from '@reduxjs/toolkit'
import { getFee } from 'utils/fees'
import { replaceSwapState, selectCurrency, switchCurrencies } from '@src/state/swap/actions'
import { updateFee } from './actions'
import { AppState } from '..'

const isCurrencyChangeAction = isAnyOf(selectCurrency, replaceSwapState, switchCurrencies)
const isSelectCurrency = isAnyOf(selectCurrency)
const isReplaceState = isAnyOf(replaceSwapState)

function isDateLater(dateA: string, dateB: string): boolean {
  const [parsedDateA, parsedDateB] = [Date.parse(dateA), Date.parse(dateB)]

  return parsedDateA > parsedDateB
}

export const applyFeeMiddleware: Middleware = ({ dispatch, getState }) => next => async action => {
  if (isCurrencyChangeAction(action)) {
    const {
      swap: { OUTPUT },
      fee: { feesMap }
    }: Pick<AppState, 'fee' | 'swap'> = getState()

    let currencyIdFromPayload: string | undefined = OUTPUT.currencyId

    // if action is currenct selection, use that payload structure
    if (isSelectCurrency(action)) currencyIdFromPayload = action.payload.currencyId
    // payload is state replacement action
    else if (isReplaceState(action)) currencyIdFromPayload = action.payload.inputCurrencyId

    // we have a explicity token address (currencyIdFromPayload) within payload
    // use this to getFee
    if (currencyIdFromPayload) {
      const tokenFee = feesMap[currencyIdFromPayload]?.fee
      const isFeeDateValid = tokenFee && isDateLater(tokenFee.expirationDate, new Date().toISOString())

      if (!isFeeDateValid || !tokenFee) {
        const fee = await getFee(currencyIdFromPayload)
        fee &&
          dispatch(
            updateFee({
              token: currencyIdFromPayload,
              fee
            })
          )
      }
    }
  }

  next(action)
}
