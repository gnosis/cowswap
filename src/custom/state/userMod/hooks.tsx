import { useCallback } from 'react'
import { AppState } from 'state/index'
import { closeAnnouncement } from './actions'
import { useAppDispatch, useAppSelector } from 'state/hooks'

export function useAnnouncementVisible(contentHash?: number): boolean {
  return useAppSelector((state: AppState) => {
    // No hash, no visible
    if (!contentHash) {
      return false
    }

    // If the hash has been closed, will return false,
    // if its a new hash returns true (visible)
    return state.userMod.announcementVisible[contentHash] || true
  })
}

export function useCloseAnnouncement(): (contentHash?: number) => void {
  const dispatch = useAppDispatch()
  return useCallback(
    (contentHash?: number) => {
      if (contentHash) {
        dispatch(closeAnnouncement({ contentHash })), [dispatch, contentHash]
      }
    },
    [dispatch]
  )
}
