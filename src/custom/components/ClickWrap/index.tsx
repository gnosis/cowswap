import React from 'react'
import styled from 'styled-components'
import { NavLink } from 'react-router-dom'
import { ButtonPrimary, ButtonOutlined } from 'components/Button'

const Wrapper = styled.div`
  display: flex;
  width: 100%;
  height: auto;
  background: ${({ theme }) => theme.bg1};
  position: fixed;
  bottom: 0;
  left: 0;
  z-index: 999;
  min-height: 100px;
  padding: 16px;
  box-shadow: rgb(0 0 0) 0 -4px 0 0, rgb(0 0 0 / 16%) 0 -9px 0 0;
  justify-content: center;
  font-size: 13px;
  line-height: 1.2;

  > div {
    width: 100%;
    max-width: 1000px;
    align-items: center;
    display: grid;
    grid-column-gap: 16px;
    grid-template-columns: 0.9fr 1.1fr;
    justify-content: center;
    justify-items: center;

    ${({ theme }) => theme.mediaWidth.upToMedium`
      max-width: 100%;
      flex-flow: column wrap;
      display: flex;
    `};
  }

  > div > p {
    text-align: left;
    margin: 0;
    width: 100%;

    ${({ theme }) => theme.mediaWidth.upToMedium`
      text-align: center;
    `};
  }
`

const Form = styled.form`
  display: flex;
  flex-flow: row nowrap;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    flex-flow: column wrap;
  `};

  > span:first-of-type {
    margin: 12px 0;
    align-items: center;
    justify-content: flex-start;
    flex-flow: column wrap;

    ${({ theme }) => theme.mediaWidth.upToMedium`
      text-align: center;
    `};

    > label {
      width: 100%;
      font-size: 15px;
      font-weight: bold;
      display: block;

      ${({ theme }) => theme.mediaWidth.upToMedium`
        margin: 0 0 8px;
      `};
    }

    > label:not(:last-of-type) {
      margin: 0 8px 0 0;
    }
  }

  > span:last-of-type {
    display: flex;
    flex-flow: row nowrap;
    margin: 0 0 0 16px;
    flex: 1 0 auto;
    align-items: center;

    > button {
      height: 100%;
      max-height: 62px;
    }

    > button:not(:last-of-type) {
      margin: 0 16px 0 0;
    }
  }
`

export default function ClickWrap() {
  return (
    <Wrapper>
      <div>
        <p>
          We use cookies to provide you with the best experience and to help improve our website and application. Please
          read our <NavLink to="/cookie-policy">Cookie Policy</NavLink> for more information. By clicking &apos;Accept
          all&apos;, you agree to the storing of cookies on your device to enhance site navigation, analyze site usage
          and provide customer support.
        </p>
        <Form>
          <span>
            <label>
              <input type="checkbox" name="cookies-necessary" value="c-necessary" checked disabled /> Necessary
            </label>
            <label>
              <input type="checkbox" name="cookies-support" value="c-support" /> Customer Support
            </label>
            <label>
              <input type="checkbox" name="cookies-analytics" value="c-analytics" /> Analytics
            </label>
          </span>

          <span>
            <ButtonOutlined>Accept selection</ButtonOutlined>
            <ButtonPrimary>Accept All</ButtonPrimary>
          </span>
        </Form>
      </div>
    </Wrapper>
  )
}
