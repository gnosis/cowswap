import { PRODUCTION_URL } from '@src/custom/constants'
import React from 'react'
import { default as URLWarningUni } from './URLWarningMod'

export * from './URLWarningMod'

export default function URLWarning() {
  return <URLWarningUni url={PRODUCTION_URL} />
}
