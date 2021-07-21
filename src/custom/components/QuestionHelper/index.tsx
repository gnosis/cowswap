import React from 'react'
import styled from 'styled-components/macro'
import SVG from 'react-inlinesvg'
import QuestionImage from 'assets/svg/question.svg'

export function QuestionMark() {
  return <SVG src={QuestionImage} title="Tooltip" />
}

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

export * from '@src/components/QuestionHelper'
export { default } from './QuestionHelperMod'
