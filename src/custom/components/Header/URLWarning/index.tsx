import React from 'react'

import { PRODUCTION_URL } from 'constants/index'
import URLWarningUni from './URLWarningMod'
import ReactMarkdown from 'react-markdown'

export * from './URLWarningMod'

export default function URLWarning({ announcementText }: { announcementText?: string }) {
  return (
    <URLWarningUni url={PRODUCTION_URL}>
      {announcementText && <ReactMarkdown>{announcementText}</ReactMarkdown>}
    </URLWarningUni>
  )
}
