import React from 'react'

import { PRODUCTION_URL } from 'constants/index'
import { AlertTriangle, X } from 'react-feather'
import URLWarningUni, { StyledClose } from './URLWarningMod'
import ReactMarkdown from 'react-markdown'
import {
  useAnnouncementVisible as useAnnouncementVisible,
  useCloseAnnouncement as useCloseAnnouncement,
} from '@src/custom/state/userMod/hooks'
import useMarkdown from 'hooks/useMarkdown'
import { hashCode } from 'utils/misc'

export * from './URLWarningMod'

// https://github.com/gnosis/cowswap/blob/announcements/docs/announcements.md
const ANNOUNCEMENTS_MARKDOWN_URL =
  'https://raw.githubusercontent.com/gnosis/cowswap/announcements/docs/announcements.md'

export default function URLWarning() {
  // Ger announcement if there's one
  const announcementText = useMarkdown(ANNOUNCEMENTS_MARKDOWN_URL).trim()
  const contentHash = announcementText ? hashCode(announcementText) : undefined
  const announcementVisible = useAnnouncementVisible(contentHash)
  const closeAnnouncement = useCloseAnnouncement()

  const announcement = announcementVisible && (
    <>
      <div style={{ display: 'flex' }}>
        <AlertTriangle style={{ marginRight: 6 }} size={12} /> <ReactMarkdown>{announcementText}</ReactMarkdown>
      </div>
      <StyledClose size={12} onClick={() => closeAnnouncement(contentHash)} />
    </>
  )

  return <URLWarningUni url={PRODUCTION_URL} announcement={announcement} />
}
