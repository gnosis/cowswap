import styled from 'styled-components'

const Pill = styled.strong<{ color?: string; bgColor?: string }>`
  padding: 0.2rem 0.4rem;
  border-radius: 1rem;
  color: ${(props): string => props.color || 'inherit'};
  background-color: ${(props): string => props.bgColor || 'transparent'};
  margin-right: 0.5rem;
  font-size: smaller;
  white-space: nowrap;
`
export default Pill
