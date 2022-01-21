import styled from 'styled-components/macro'
import CheckCircle from 'assets/cow-swap/check.svg'
import { transparentize } from 'polished'

export const Wrapper = styled.div`
  width: 100%;
  display: flex;
  flex-flow: row wrap;
  margin: 12px 0 24px;
`

export const Step = styled.div<{
  totalSteps: number
  isActiveStep: boolean
  completedStep: boolean
  circleSize?: number
}>`
  display: flex;
  flex-flow: column wrap;
  align-items: center;
  position: relative;
  flex: 1 1 ${({ totalSteps }) => `calc(100% / ${totalSteps})`};

  &::before,
  &::after {
    content: '';
    position: absolute;
    top: ${({ circleSize }) => (circleSize ? `calc(${circleSize / 2}px` : '21px')};
    height: 1px;
    border-top: 1px solid ${({ theme }) => theme.border2};
  }

  &::before {
    left: 0;
    right: 50%;
    margin-right: ${({ circleSize }) => (circleSize ? `${circleSize}px` : '42px')};
  }

  &::after {
    right: 0;
    left: 50%;
    margin-left: ${({ circleSize }) => (circleSize ? `${circleSize}px` : '42px')};
  }

  &:first-child::before,
  &:last-child::after {
    content: none;
    display: none;
  }

  > span {
    display: flex;
    flex-flow: column wrap;
    align-items: center;
    justify-content: center;
    width: ${({ circleSize }) => (circleSize ? `${circleSize}px` : '42px')};
    height: ${({ circleSize }) => (circleSize ? `${circleSize}px` : '42px')};
    margin: 0 auto 12px;
    border-radius: ${({ circleSize }) => (circleSize ? `${circleSize}px` : '42px')};
    text-align: center;
    line-height: 1;
    font-size: 100%;
    position: relative;
    color: ${({ isActiveStep, completedStep, theme }) =>
      completedStep ? theme.black : isActiveStep ? theme.black : transparentize(0.4, theme.text1)};
    background: ${({ isActiveStep, completedStep, theme, circleSize }) =>
      completedStep
        ? `url(${CheckCircle}) no-repeat center/${circleSize ? `${circleSize}px` : '42px'}`
        : isActiveStep
        ? theme.primary1
        : theme.blueShade3};

    > small {
      font-size: inherit;
      color: inherit;
      display: ${({ completedStep }) => (completedStep ? 'none' : 'block')};
    }
  }

  > b {
    color: ${({ isActiveStep, completedStep, theme }) =>
      completedStep ? theme.text1 : isActiveStep ? theme.text1 : transparentize(0.4, theme.text1)};
    font-weight: ${({ isActiveStep, completedStep }) => (completedStep ? '300' : isActiveStep ? 'bold' : '300')};
  }

  > i {
    font-style: normal;
    color: ${({ isActiveStep, completedStep, theme }) =>
      completedStep
        ? transparentize(0.2, theme.text1)
        : isActiveStep
        ? transparentize(0.2, theme.text1)
        : transparentize(0.4, theme.text1)};
    font-size: 12px;
    margin: 6px 0 0;
    padding: 0 24px;
    text-align: center;
  }
`

interface StepperProps {
  stepsData: {
    id: number
    title: string
    subtitle?: string
  }[]
  activeStep: number
}

export function Stepper({ stepsData, activeStep }: StepperProps) {
  return (
    <Wrapper>
      {stepsData.map(({ id, title, subtitle }) => {
        const completedStep = activeStep > id
        const isActiveStep = activeStep === id
        return (
          <Step key={id} totalSteps={stepsData.length} isActiveStep={isActiveStep} completedStep={completedStep}>
            <span>
              <small>{id + 1}</small>
            </span>
            <b>{title}</b>
            <i>{subtitle}</i>
          </Step>
        )
      })}
    </Wrapper>
  )
}
