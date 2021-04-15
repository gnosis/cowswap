import { WithClassName } from '@src/custom/types'
import React from 'react'
import styled from 'styled-components'

import SettingsMod, { StyledMenuButton, StyledMenuIcon, EmojiWrapper } from './SettingsMod'

const Wrapper = styled(SettingsMod)`
  color: red;

  b {
    margin: 0px 5px 0px 0px;
  }

  ${EmojiWrapper} {
    position: absolute;
    /* width: 50px; */
    flex-direction: row;
    top: 0px;
    right: 100px;

    span:first-child {
      font-size: 30px;
      z-index: 100;
      /* display: block; */
      position: absolute;
      top: -11px;
      right: -3px;
    }

    span:last-child {
      font-size: 25px;
      /* display: block; */
      position: absolute;
      bottom: 0;
      right: 0;
    }
  }
`

export interface SettingsButtonProps {
  toggleSettings: () => void
  expertMode: boolean
}

export interface SettingsTabProp extends WithClassName {
  SettingsButton: React.FC<SettingsButtonProps>
}

function SettingsButton({ toggleSettings, expertMode }: SettingsButtonProps) {
  return (
    <StyledMenuButton onClick={toggleSettings} id="open-settings-dialog-button">
      <b>Settings</b>
      <StyledMenuIcon />
      {expertMode ? (
        <EmojiWrapper>
          <span role="img" aria-label="cow-icon">
            🐮
          </span>
          <span role="img" aria-label="kimono-icon">
            🥋
          </span>
        </EmojiWrapper>
      ) : null}
    </StyledMenuButton>
  )
}

export default function SettingsTab() {
  return <Wrapper SettingsButton={SettingsButton} />
}
