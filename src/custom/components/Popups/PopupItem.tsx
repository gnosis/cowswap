import React from 'react'
import styled from 'styled-components'
import { PopupContent } from 'state/application/actions'
import { default as Wrapper, Popup as PopupUni } from './PopupItemMod'

// export const StyledPopupItem = styled(PopupItemMod)``

export const PopupCustom = styled(PopupUni)`
  border: 2px solid ${({ theme }) => theme.black};
  box-shadow: 2px 2px 0 ${({ theme }) => theme.black};

  a {
    text-decoration: underline;
    color: ${({ theme }) => theme.redShade};
  }
`

export function PopupItem({
  removeAfterMs,
  content,
  popKey
}: {
  removeAfterMs: number | null
  content: PopupContent
  popKey: string
}) {
  return <Wrapper removeAfterMs={removeAfterMs} content={content} popKey={popKey} PopupCustom={PopupCustom} />
}

export default PopupItem
