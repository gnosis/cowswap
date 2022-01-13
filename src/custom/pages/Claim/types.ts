import { UserClaimData } from '@src/custom/state/claim/hooks'
import { CurrencyAmount, Token } from '@uniswap/sdk-core'
import { SyntheticEvent } from 'react'

export type ClaimCommonTypes = {
  account: string | null | undefined
  hasClaims: boolean
  tokenCurrencyAmount: CurrencyAmount<Token>
  handleChangeAccount: (e: SyntheticEvent<HTMLButtonElement>) => void
}

// Structure that the claim data will be inside our claim page component
// We add some additional properties that we need in UI and keep the UI clean
export type UserClaimDataDetails = UserClaimData & {
  currencyAmount: CurrencyAmount<Token> | undefined
  price: CurrencyAmount<Token> | undefined
  cost: CurrencyAmount<Token> | undefined
  isFree: boolean
  currency: string
}
