import React, { /* ReactNode, */ useCallback, useState } from 'react'
import styled from 'styled-components/macro'
import Tooltip from 'components/Tooltip'
import { TooltipProps } from '../Tooltip/TooltipMod'

const QuestionWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0px;
  width: 18px;
  height: 18px;
  border: none;
  background: none;
  outline: none;
  cursor: default;
  border-radius: 36px;
  font-size: 12px;
  background-color: ${({ theme }) => theme.bg2};
  color: ${({ theme }) => theme.text2};

  :hover,
  :focus {
    opacity: 0.7;
  }
`

const QuestionMark = styled.span`
  font-size: 14px;
`

const QuestionHelperContainer = styled.span`
  margin-left: 4px;
  display: flex;
  align-items: center;
`

interface QuestionHelperProps extends Omit<TooltipProps, 'children' | 'show'> {
  className?: string
}

export default function QuestionHelper({ text, className, ...tooltipProps }: QuestionHelperProps) {
  const [, setShow] = useState<boolean>(false)

  const open = useCallback(() => setShow(true), [setShow])
  const close = useCallback(() => setShow(false), [setShow])

  return (
    <QuestionHelperContainer className={className}>
      <Tooltip {...tooltipProps} show={true} text={text}>
        <QuestionWrapper onClick={open} onMouseEnter={open} onMouseLeave={close}>
          <QuestionMark>?</QuestionMark>
        </QuestionWrapper>
      </Tooltip>
    </QuestionHelperContainer>
  )
}
