import { PRODUCTION_URL } from '@src/custom/constants'
import React from 'react'
export * from './URLWarningMod'
import { default as URLWarningUni } from './URLWarningMod'

export default function URLWarning() {
  return <URLWarningUni url={PRODUCTION_URL} />
}
