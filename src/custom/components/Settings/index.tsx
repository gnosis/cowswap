import React, { useContext, useRef, useState } from 'react'
import { Settings } from 'react-feather'
import { Text } from 'rebass'
import styled, { ThemeContext } from 'styled-components'
import { useOnClickOutside } from 'hooks/useOnClickOutside'
import { ApplicationModal } from 'state/application/actions'
import { useModalOpen, useToggleSettingsMenu } from 'state/application/hooks'
import {
  useExpertModeManager,
  useUserTransactionTTL,
  useUserSlippageTolerance,
  useUserSingleHopOnly
} from 'state/user/hooks'
import { TYPE } from 'theme'
import { ButtonError } from 'components/Button'
import { AutoColumn } from 'components/Column'
import Modal from 'components/Modal'
import QuestionHelper from 'components/QuestionHelper'
import { RowBetween, RowFixed } from 'components/Row'
import Toggle from 'components/Toggle'
import TransactionSettings from 'components/TransactionSettings'
import { StyledCloseIcon, StyledMenu, MenuFlyout, Break, ModalContentWrapper } from './SettingsMod'

const StyledMenuIcon = styled(Settings)`
  height: 20px;
  width: 20px;

  > * {
    stroke: ${({ theme }) => theme.text2};
  }
`

const EmojiWrapper = styled.div`
  position: absolute;
  bottom: -9px;
  right: -2px;
  font-size: 21px;
`

const StyledMenuButton = styled.button`
  position: relative;
  width: 100%;
  height: 100%;
  border: none;
  background-color: transparent;
  margin: 0;
  padding: 0;
  height: 35px;
  display: flex;
  align-items: center;
  padding: 0.15rem 0.5rem;
  border-radius: 0.5rem;
  transition: opacity 0.2s ease-in-out;

  &:hover,
  &:focus {
    cursor: pointer;
    outline: none;
    opacity: 0.7;
  }

  > b {
    margin: 0 5px 0 0;
  }

  svg {
    margin-top: 2px;
  }
`

export default function SettingsTab() {
  const node = useRef<HTMLDivElement>()
  const open = useModalOpen(ApplicationModal.SETTINGS)
  const toggle = useToggleSettingsMenu()

  const theme = useContext(ThemeContext)
  const [userSlippageTolerance, setUserslippageTolerance] = useUserSlippageTolerance()

  const [ttl, setTtl] = useUserTransactionTTL()

  const [expertMode, toggleExpertMode] = useExpertModeManager()

  const [singleHopOnly, setSingleHopOnly] = useUserSingleHopOnly()

  // show confirmation view before turning on
  const [showConfirmation, setShowConfirmation] = useState(false)

  useOnClickOutside(node, open ? toggle : undefined)

  return (
    // https://github.com/DefinitelyTyped/DefinitelyTyped/issues/30451
    <StyledMenu ref={node as any}>
      <Modal isOpen={showConfirmation} onDismiss={() => setShowConfirmation(false)} maxHeight={100}>
        <ModalContentWrapper>
          <AutoColumn gap="lg">
            <RowBetween style={{ padding: '0 2rem' }}>
              <div />
              <Text fontWeight={500} fontSize={20}>
                Are you sure?
              </Text>
              <StyledCloseIcon onClick={() => setShowConfirmation(false)} />
            </RowBetween>
            <Break />
            <AutoColumn gap="lg" style={{ padding: '0 2rem' }}>
              <Text fontWeight={500} fontSize={20}>
                Expert mode turns off the confirm transaction prompt and allows high slippage trades that often result
                in bad rates and lost funds.
              </Text>
              <Text fontWeight={600} fontSize={20}>
                ONLY USE THIS MODE IF YOU KNOW WHAT YOU ARE DOING.
              </Text>
              <ButtonError
                error={true}
                padding={'12px'}
                onClick={() => {
                  if (window.prompt(`Please type the word "confirm" to enable expert mode.`) === 'confirm') {
                    toggleExpertMode()
                    setShowConfirmation(false)
                  }
                }}
              >
                <Text fontSize={20} fontWeight={500} id="confirm-expert-mode">
                  Turn On Expert Mode
                </Text>
              </ButtonError>
            </AutoColumn>
          </AutoColumn>
        </ModalContentWrapper>
      </Modal>
      <StyledMenuButton onClick={toggle} id="open-settings-dialog-button">
        <b>Settings</b>
        <StyledMenuIcon />
        {expertMode ? (
          <EmojiWrapper>
            <span role="img" aria-label="wizard-icon">
              🐮
            </span>
          </EmojiWrapper>
        ) : null}
      </StyledMenuButton>
      {open && (
        <MenuFlyout>
          <AutoColumn gap="md" style={{ padding: '1rem' }}>
            <Text fontWeight={600} fontSize={14}>
              Transaction Settings
            </Text>
            <TransactionSettings
              rawSlippage={userSlippageTolerance}
              setRawSlippage={setUserslippageTolerance}
              deadline={ttl}
              setDeadline={setTtl}
            />
            <Text fontWeight={600} fontSize={14}>
              Interface Settings
            </Text>
            <RowBetween>
              <RowFixed>
                <TYPE.black fontWeight={400} fontSize={14} color={theme.text2}>
                  Toggle Expert Mode
                </TYPE.black>
                <QuestionHelper text="Bypasses confirmation modals and allows high slippage trades. Use at your own risk." />
              </RowFixed>
              <Toggle
                id="toggle-expert-mode-button"
                isActive={expertMode}
                toggle={
                  expertMode
                    ? () => {
                        toggleExpertMode()
                        setShowConfirmation(false)
                      }
                    : () => {
                        toggle()
                        setShowConfirmation(true)
                      }
                }
              />
            </RowBetween>
            <RowBetween>
              <RowFixed>
                <TYPE.black fontWeight={400} fontSize={14} color={theme.text2}>
                  Disable Multihops
                </TYPE.black>
                <QuestionHelper text="Restricts swaps to direct pairs only." />
              </RowFixed>
              <Toggle
                id="toggle-disable-multihop-button"
                isActive={singleHopOnly}
                toggle={() => (singleHopOnly ? setSingleHopOnly(false) : setSingleHopOnly(true))}
              />
            </RowBetween>
          </AutoColumn>
        </MenuFlyout>
      )}
    </StyledMenu>
  )
}
