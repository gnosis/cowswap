import { isAnyOf, Middleware } from '@reduxjs/toolkit'
import { getFee } from 'utils/fees'
import { selectCurrency } from '@src/state/swap/actions'
import { updateFee } from './actions'
import { FeeInformationState } from './reducer'

const isCurrencyChangeAction = isAnyOf(selectCurrency)

export const applyFeeMiddleware: Middleware = ({ dispatch, getState }) => next => async action => {
  if (isCurrencyChangeAction(action)) {
    console.debug(`
      ========================================================
      🚀  [FEE MIDDLEWARE] SELECT_CURRENCY ACTION DETECTED
      ========================================================
    `)
    const { payload } = action

    // check actions as several should trigger this update
    // e.g direct selection? yes, also has payload to check token type
    // but switchCurrencies? has no payload, but must be used to check tip

    const {
      fee: { feesMap }
    }: { fee: FeeInformationState } = getState()

    const tokenFee = feesMap[payload.currencyId]?.fee

    if (!tokenFee) {
      const fee = await getFee(payload.currencyId)
      dispatch(
        updateFee({
          token: payload.currencyId,
          fee
        })
      )
    }

    console.debug(`
    ========================================================
    🚀  [FEE MIDDLEWARE] SELECT_CURRENCY ACTION DETECTED
        PAYLOAD:  ${JSON.stringify(payload, null, 2)}
        FEE:      ${JSON.stringify(getState().fee.feesMap[payload.currencyId]?.fee, null, 2)}
    ========================================================
      `)
  }

  next(action)
}
