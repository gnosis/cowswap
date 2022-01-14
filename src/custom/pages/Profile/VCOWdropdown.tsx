import { useCallback, useRef, useState } from 'react'
import styled from 'styled-components/macro'
import { useOnClickOutside } from 'hooks/useOnClickOutside'
import { ChevronDown } from 'react-feather'

export default function VCOWdropdown() {
  const [open, setOpen] = useState(false)
  const toggle = useCallback(() => setOpen((open) => !open), [])
  const node = useRef<HTMLDivElement>(null)
  useOnClickOutside(node, open ? toggle : undefined)

  return (
    <Wrapper ref={node}>
      <AddressInfo onClick={toggle}>
        <span style={{ marginRight: '2px' }}>adss</span>
        <ChevronDown size={16} style={{ marginTop: '2px' }} strokeWidth={2.5} />
      </AddressInfo>
      {open && <MenuFlyout>sasdad</MenuFlyout>}
    </Wrapper>
  )
}

const Wrapper = styled.div`
  position: relative;
  display: inline;
  margin-right: 0.4rem;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    justify-self: end;
  `};

  ${({ theme }) => theme.mediaWidth.upToSmall`
    margin: 0 0.5rem 0 0;
    width: initial;
    text-overflow: ellipsis;
    flex-shrink: 1;
  `};
`

const MenuFlyout = styled.span`
  background-color: ${({ theme }) => theme.bg4};
  border: 1px solid ${({ theme }) => theme.bg0};

  box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.01), 0px 4px 8px rgba(0, 0, 0, 0.04), 0px 16px 24px rgba(0, 0, 0, 0.04),
    0px 24px 32px rgba(0, 0, 0, 0.01);
  border-radius: 12px;
  padding: 0.3rem;
  display: flex;
  flex-direction: column;
  font-size: 1rem;
  position: absolute;
  left: 0;
  top: 1.75rem;
  z-index: 100;
  min-width: 350px;
  ${({ theme }) => theme.mediaWidth.upToMedium`;
    min-width: 145px
  `};

  > {
    padding: 12px;
  }
`
/* const MenuItem = css`
  align-items: center;
  background-color: transparent;
  border-radius: 12px;
  color: ${({ theme }) => theme.text2};
  cursor: pointer;
  display: flex;
  flex: 1;
  flex-direction: row;
  font-size: 16px;
  font-weight: 400;
  justify-content: start;
  :hover {
    text-decoration: none;
  }
` */

export const AddressInfo = styled.button`
  align-items: center;
  background-color: ${({ theme }) => theme.bg4};
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.bg0};
  color: ${({ theme }) => theme.text1};
  display: inline-flex;
  flex-direction: row;
  font-weight: 700;
  font-size: 12px;
  height: 100%;
  margin: 0 0.4rem;
  padding: 0.2rem 0.4rem;

  :hover,
  :focus {
    cursor: pointer;
    outline: none;
    border: 1px solid ${({ theme }) => theme.bg3};
  }
`
