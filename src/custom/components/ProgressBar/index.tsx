import { useState } from 'react'
import { ProgressBarWrap, ProgressContainer, Progress, Label, FlexWrap } from './styled'

interface progressBarProps {
  value: number
}

export function ProgressBar({ value }: progressBarProps) {
  const [progressVal, setProgressVal] = useState(value)
  const progressVals = [
    {
      value: 0,
      label: '0%',
    },
    {
      value: 25,
      label: '25%',
    },
    {
      value: 50,
      label: '50%',
    },
    {
      value: 75,
      label: '75%',
    },
    {
      value: 100,
      label: '100%',
    },
  ]

  return (
    <FlexWrap>
      <ProgressBarWrap>
        {progressVals.map((item, index) => (
          <Label position={item.value} onClick={() => setProgressVal(item.value)} key={`${item.value}-${index}`}>
            {item.label}
          </Label>
        ))}
        <ProgressContainer>
          <Progress value={progressVal} />
        </ProgressContainer>
      </ProgressBarWrap>
    </FlexWrap>
  )
}
