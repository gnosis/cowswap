import { useState } from 'react'
import { ProgressBarWrap, ProgressContainer, Progress, Label, FlexWrap, HiddenRange, ProgressVal } from './styled'

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
  const minVal = progressVals[0].value
  const maxVal = progressVals[progressVals.length - 1].value

  return (
    <FlexWrap>
      <ProgressBarWrap>
        {progressVals.map((item, index) => (
          <Label position={item.value} onClick={() => setProgressVal(item.value)} key={`${item.value}-${index}`}>
            {item.label}
          </Label>
        ))}
        <ProgressContainer>
          <HiddenRange
            onChange={(e) => setProgressVal(parseFloat(e.target.value))}
            min={minVal}
            max={maxVal}
            value={progressVal}
            type="range"
          />
          <Progress value={progressVal} />
          <ProgressVal>{progressVal}%</ProgressVal>
        </ProgressContainer>
      </ProgressBarWrap>
    </FlexWrap>
  )
}
