import { isAnyOf, Middleware } from '@reduxjs/toolkit'
import { getFee } from 'utils/fees'
import { replaceSwapState, selectCurrency, switchCurrencies } from '@src/state/swap/actions'
import { updateFee } from './actions'
import { FeeInformationState } from './reducer'
import { SwapState } from '@src/state/swap/reducer'

const isCurrencyChangeAction = isAnyOf(selectCurrency, replaceSwapState, switchCurrencies)
const isSelectCurrency = isAnyOf(selectCurrency)
const isReplaceState = isAnyOf(replaceSwapState)

export const applyFeeMiddleware: Middleware = ({ dispatch, getState }) => next => async action => {
  if (isCurrencyChangeAction(action)) {
    const {
      swap: {
        OUTPUT: { currencyId }
      },
      fee: { feesMap }
    }: { fee: FeeInformationState; swap: SwapState } = getState()

    console.log('🚀  [FEE MIDDLEWARE] currencyId from STATE =>', currencyId)

    let currencyIdFromPayload: string | undefined = currencyId

    if (isSelectCurrency(action)) currencyIdFromPayload = action.payload.currencyId
    else if (isReplaceState(action)) currencyIdFromPayload = action.payload.inputCurrencyId

    // we have a explicity token address (currencyIdFromPayload) within payload
    // use this to getFee
    if (currencyIdFromPayload) {
      const tokenFee = feesMap[currencyIdFromPayload]?.fee

      if (!tokenFee) {
        const fee = await getFee(currencyIdFromPayload)
        dispatch(
          updateFee({
            token: currencyIdFromPayload,
            fee
          })
        )
      }

      console.log(`
    ========================================================
    🚀  [FEE MIDDLEWARE] SELECT_CURRENCY ACTION DETECTED
        PAYLOAD:  ${JSON.stringify(action.payload, null, 2)}
        FEE:      ${JSON.stringify(getState().fee.feesMap[currencyIdFromPayload]?.fee, null, 2)}
    ========================================================
      `)
    }
  }

  next(action)
}
