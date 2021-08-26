import React from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { MEDIA_WIDTHS } from '@src/theme'
import Page, { Title, Content, GdocsListStyle } from 'components/Page'
import { ButtonPrimary } from 'custom/components/Button'
import cow404IMG from 'assets/cow-swap/cow-404.png'

const Wrapper = styled(Page)`
  ${GdocsListStyle}

  span[role="img"] {
    font-size: 1.8em;
  }

  ${Title} {
    margin-bottom: 50px;
    font-size: 26px;
    @media screen and (max-width: ${MEDIA_WIDTHS.upToSmall}px) {
      font-size: 18px;
      text-align: center;
    }
  }
`

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  ${ButtonPrimary} {
    width: 196px;
    padding: 9px;
  }
  h2 {
    margin-top: 36px;
    margin-bottom: 32px;
  }
  img {
    max-width: 506px;
  }
  @media screen and (max-width: ${MEDIA_WIDTHS.upToSmall}px) {
    img {
      max-width: 287px;
    }
    h2 {
      font-size: 16px;
      text-align: center;
    }
  }
`

export default function NotFound() {
  return (
    <Wrapper>
      <Title>Page not found!</Title>
      <Content>
        <Container>
          <img src={cow404IMG} alt="CowSwap 404 not found" />
          <h2>The page you are looking for does not exist. </h2>
          <ButtonPrimary as={Link} to={'/'}>
            Back home
          </ButtonPrimary>
        </Container>
      </Content>
    </Wrapper>
  )
}
