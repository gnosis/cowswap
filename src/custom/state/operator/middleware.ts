import { Middleware } from '@reduxjs/toolkit'
import { getTip } from '@src/custom/utils/price'
import { selectCurrency } from '@src/state/swap/actions'
import { updateTip } from './actions'
import { OperatorState } from './reducer'

export const applyTipMiddleware: Middleware = ({ dispatch, getState }) => next => async action => {
  // check that incoming action is a selected token
  const isTriggerAction = action.type === selectCurrency.type

  if (isTriggerAction) {
    const { payload } = action

    // check actions as several should trigger this update
    // e.g direct selection? yes, also has payload to check token type
    // but switchCurrencies? has no payload, but must be used to check tip

    const {
      operator: { tipsMap }
    }: { operator: OperatorState } = getState()

    const tokenTip = tipsMap[payload.currencyId]?.tip

    if (!tokenTip) {
      const tip = await getTip(payload.currencyId)
      dispatch(
        updateTip({
          token: payload.currencyId,
          tip
        })
      )
    }

    console.debug(`
    ========================================================
    🚀  [TIP MIDDLEWARE] SELECT_CURRENCY ACTION DETECTED


        PAYLOAD:  ${JSON.stringify(payload, null, 2)}
        TIP:      ${getState().operator.tipsMap[payload.currencyId]?.tip}
    ========================================================
      `)
  }

  next(action)
}
