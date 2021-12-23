import styled from 'styled-components/macro'
import * as CSS from 'csstype'
import { FlexWrap as FlexWrapMod } from 'pages/Profile/styled'
import { Txt as TxtMod } from 'assets/styles/styled'

export const FlexWrap = styled(FlexWrapMod)`
  max-width: 100%;
  align-items: flex-end;
`

export const ProgressBarWrap = styled(FlexWrapMod)`
  max-width: 500px; //optional
  padding-top: 40px;
  position: relative;
`

export const ProgressContainer = styled.div`
  background-color: transparent;
  height: 30px;
  width: 100% !important;
  border: 1px solid ${({ theme }) => theme.cardBorder};
  position: relative;
  overflow: hidden;
`

export const Progress = styled.div<Partial<CSS.Properties & { value: number }>>`
  background-image: linear-gradient(to right, #d3e501, #d29145, #ce01b9);
  width: 100%;
  max-width: ${(props) => props.value}%;
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  transition: max-width 0.2s;
`

export const Label = styled.a<Partial<CSS.Properties & { position: any }>>`
  cursor: pointer;
  position: absolute;
  top: 10px;
  left: ${(props) => props.position}%;
  transform: translateX(-50%);
  font-weight: bold;
  text-decoration: underline;

  &:first-child {
    transform: none;
  }

  &:hover {
    text-decoration: none;
  }
`

export const Txt = styled(TxtMod)`
  font-size: 20px;
  font-weight: bold;
  margin-left: 15px;
`
