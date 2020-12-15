import styled from 'styled-components'

const Pill = styled.strong<{ bgColor: string }>`
  padding: 0.2rem 0.4rem;
  border-radius: 1rem;
  background-color: ${(props): string => props.bgColor};
  margin-right: 0.5rem;
  font-size: smaller;
  white-space: nowrap;
`
export default Pill
