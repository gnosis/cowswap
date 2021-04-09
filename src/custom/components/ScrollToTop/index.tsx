import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { ArrowUpCircle } from 'react-feather'
import useDebouncedChangeHandler from 'utils/useDebouncedChangeHandler'

interface WrapperProps {
  top?: string
  right?: string
  bottom?: string
  left?: string
  background?: string
}

const Wrapper = styled.div<WrapperProps>`
    position: fixed;
    ${({ top }): string | undefined => top && `top: ${top};`}
    ${({ left }): string | undefined => left && `left: ${left};`}
    ${({ bottom }): string | undefined => bottom && `bottom: ${bottom};`}
    ${({ right }): string | undefined => right && `right: ${right};`}

    display: flex;
    flex-flow: row nowrap;
    justify-content: center; 
    align-items: center;

    font-size: larger;
    background: ${({ background, theme }) => background || theme.primary1}
    border-radius: ${({ theme }) => theme.buttonPrimary.borderRadius}

    padding: 0.2rem 0.4rem;

    cursor: pointer;
    opacity: 0.4;

    &:hover {
        opacity: 1;
    }

    > svg {
        margin: 0 0.4rem;
    }

    transition: opacity 0.4s ease-in-out;
`

export default function ScrollToTop(props: { styleProps?: WrapperProps }) {
  const [position, setPosition] = useState(window.scrollY)
  const [, debouncedSetPosition] = useDebouncedChangeHandler(position, setPosition, 500)

  const handleClick = () => window.scrollTo(0, 0)

  useEffect(() => {
    const scrollListener = () => debouncedSetPosition(window.scrollY)

    window.addEventListener('scroll', scrollListener)

    return () => window.removeEventListener('scroll', scrollListener)
  }, [debouncedSetPosition])

  if (position < 250) return null

  return (
    <Wrapper {...props.styleProps} onClick={handleClick}>
      Scroll to top <ArrowUpCircle size="1.6rem" />
    </Wrapper>
  )
}
