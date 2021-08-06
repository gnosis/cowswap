import { useCallback } from 'react'
import { AppState } from 'state/index'
import { closeAnnouncementWarning } from './actions'
import { useAppDispatch, useAppSelector } from 'state/hooks'

export function useAnnouncementWarningVisible(contentHash: number): boolean {
  return useAppSelector((state: AppState) => state.userMod.announcementMessageVisible[contentHash] || true)
}

export function useCloseAnnouncementWarning(contentHash: number): () => void {
  const dispatch = useAppDispatch()
  return useCallback(() => dispatch(closeAnnouncementWarning({ contentHash })), [dispatch, contentHash])
}
