import { Middleware } from '@reduxjs/toolkit'
import { getTip } from '@src/custom/utils/price'
import { Field, selectCurrency } from '@src/state/swap/actions'
import { updateTip } from './actions'
import { OperatorState } from './reducer'

export const applyTipMiddleware: Middleware = ({ dispatch, getState }) => next => async action => {
  // check that incoming action is a selected token
  const isTriggerAction = action.type === selectCurrency.type

  if (isTriggerAction) {
    const { payload } = action as ReturnType<typeof selectCurrency>
    const isSellToken = payload?.field === Field.INPUT

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

        SELL/BUY: ${isSellToken ? 'SELL' : 'BUY'}

        PAYLOAD:  ${JSON.stringify(payload, null, 2)}
        TIP:      ${tokenTip}
    ========================================================
      `)
  }

  next(action)
}
