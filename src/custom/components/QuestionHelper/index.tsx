import React from 'react'
import styled from 'styled-components/macro'
import SVG from 'react-inlinesvg'
import QuestionImage from 'assets/svg/question.svg'
import { TooltipProps } from 'components/Tooltip/TooltipMod'
import QuestionHelperMod from './QuestionHelperMod'

const QuestionMark = () => <SVG src={QuestionImage} />

export const QuestionWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  width: 16px;
  height: 16px;
  border: none;
  background: none;
  outline: none;
  cursor: default;
  border-radius: 16px;
  background-color: transparent;

  > svg > path {
    stroke: ${({ theme }) => theme.text1};
  }
`
export interface QuestionHelperProps extends Omit<TooltipProps, 'children' | 'show'> {
  className?: string
  QuestionMark?: () => JSX.Element
}

export default function QuestionHelper(props: QuestionHelperProps) {
  return <QuestionHelperMod {...props} QuestionMark={QuestionMark} />
}
