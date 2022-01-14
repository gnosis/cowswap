import { useCallback, useMemo, useState } from 'react'
import { CheckCircle } from 'react-feather'
import { CurrencyAmount } from '@uniswap/sdk-core'
import { formatUnits, parseUnits } from '@ethersproject/units'

import Row from 'components/Row'
import { InvestAvailableBar, InvestInput, InvestSummary, InvestTokenGroup, TokenLogo } from 'pages/Claim/styled'
import CowProtocolLogo from 'components/CowProtocolLogo'
import { ApprovalState } from 'hooks/useApproveCallback'
import { EnhancedUserClaimData } from 'pages/Claim/types'
import { formatSmart } from 'utils/format'
import { FULL_PRICE_PRECISION } from 'constants/index'
import { useCurrencyBalance } from 'state/wallet/hooks'
import { useActiveWeb3React } from 'hooks/web3'

export type Props = { claim: EnhancedUserClaimData; approveState: ApprovalState; approveCallback: () => void }

export function InvestmentTokenGroup(props: Props): JSX.Element | null {
  const { claim, approveCallback, approveState } = props

  const { account } = useActiveWeb3React()

  const { currencyAmount, price, cost: maxCost } = claim
  const token = currencyAmount?.currency

  const balance = useCurrencyBalance(account || undefined, token)

  // TODO: move it to global state or something
  const [investmentAmount, setInvestmentAmount] = useState('0')

  const onMaxClick = useCallback(() => {
    if (!maxCost || !balance) {
      return
    }

    const amount = maxCost.greaterThan(balance) ? balance : maxCost
    // store the value as a string to prevent unnecessary re-renders
    setInvestmentAmount(formatUnits(amount.quotient.toString(), balance.currency.decimals))
  }, [balance, maxCost])

  const onInputChange = useCallback(
    (event) => {
      // TODO: validate input, etc, etc
      // TODO: valid number
      // TODO: 0 or more
      // TODO: up to min(max balance, max invesment)
      if (!token || isNaN(+event.target.value)) {
        return
      }

      setInvestmentAmount(event.target.value)
    },
    [token]
  )

  const vCowAmount = useMemo(() => {
    if (!token || !price) {
      return
    }

    const investA = CurrencyAmount.fromRawAmount(token, parseUnits(investmentAmount, token.decimals).toString())
    return investA.multiply(price)
  }, [investmentAmount, price, token])

  if (!token?.symbol) {
    // It'll be set by this point, but of course TS is a pain and doesn't know about that
    // Thus, we go with the nuke option and return null to make it happy
    return null
  }

  const symbol = token.symbol
  const isNative = token.isNative

  return (
    <InvestTokenGroup>
      <div>
        <span>
          <TokenLogo symbol={symbol} size={72} />
          <CowProtocolLogo size={72} />
        </span>
        <h3>Buy vCOW with {symbol}</h3>
      </div>

      <span>
        <InvestSummary>
          <span>
            <b>Price</b>{' '}
            <i>
              {formatSmart(price, FULL_PRICE_PRECISION)} vCoW per {symbol}
            </i>
          </span>
          <span>
            <b>Token approval</b>
            <i>
              {isNative ? (
                <Row>
                  {symbol} doesn&apos;t need approvals <CheckCircle color="lightgreen" style={{ marginLeft: 5 }} />
                </Row>
              ) : approveState === ApprovalState.NOT_APPROVED ? (
                `{symbol} not approved`
              ) : (
                <Row>
                  {symbol} approved <CheckCircle color="lightgreen" style={{ marginLeft: 5 }} />
                </Row>
              )}
            </i>
            {approveState === ApprovalState.NOT_APPROVED && <button onClick={approveCallback}>Approve {symbol}</button>}
          </span>
          <span>
            <b>Max. investment available</b>{' '}
            <i>
              {formatSmart(maxCost) || '0'} {symbol}
            </i>
          </span>
          <span>
            <b>Available investment used</b> <InvestAvailableBar percentage={50} />
          </span>
        </InvestSummary>
        <InvestInput>
          <div>
            <span>
              <b>Balance:</b>{' '}
              <i>
                {formatSmart(balance)} {symbol}
              </i>
              {/* Button should use the max possible amount the user can invest, considering their balance + max investment allowed */}
              <button onClick={onMaxClick}>Invest max. possible</button>
            </span>
            <label>
              <b>{symbol}</b>
              <input placeholder="0" value={investmentAmount} onChange={onInputChange} />
            </label>
            <i>Receive: {formatSmart(vCowAmount) || '0'} vCOW</i>
            {/* Insufficient balance validation error */}
            <small>
              Insufficient balance to invest. Adjust the amount or go back to remove this investment option.
            </small>
          </div>
        </InvestInput>
      </span>
    </InvestTokenGroup>
  )
}
