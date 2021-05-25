import React from 'react'
import UnsupportedCurrencyFooterMod, { UnsupportedCurrencyFooterParams } from './UnsupportedCurrencyFooterMod'

const DEFAULT_DETAILS_TEXT =
  'Some assets are not available through this interface because they may not work well with our smart contract or we are unable to allow trading for legal reasons.'
const DEFAULT_DETAILS_TITLE = 'Unsupported Assets'
const DEFAULT_SHOW_DETAILS_TEXT = 'Read more about unsupported assets'

type Props = Omit<UnsupportedCurrencyFooterParams, 'currencies'> & {
  currencies?: UnsupportedCurrencyFooterParams['currencies']
}

export default function UnsupportedCurrencyFooter({
  detailsText = DEFAULT_DETAILS_TEXT,
  detailsTitle = DEFAULT_DETAILS_TITLE,
  showDetailsText = DEFAULT_SHOW_DETAILS_TEXT,
  currencies = [],
  ...props
}: Props) {
  return (
    <UnsupportedCurrencyFooterMod
      {...props}
      detailsText={detailsText}
      detailsTitle={detailsTitle}
      showDetailsText={showDetailsText}
      currencies={currencies}
    />
  )
}
