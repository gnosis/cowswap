import React from 'react'
import gasLessSignImg from 'assets/cow-swap/gasless-sign.png'
import Page, { Title, Content } from 'components/Page'

export default function About() {
  return (
    <Page>
      <Title>About</Title>

      <Content>
        <h3>(updated: April 2021)</h3>
        <h2>What is CowSwap?</h2>
        <p>
          <strong>CowSwap</strong> is a Interdum et malesuada fames ac ante ipsum primis in faucibus. Proin vitae
          blandit leo. Etiam consequat diam eu tortor scelerisque mattis. Nulla eu lacus accumsan, consequat ante et,
          molestie ex. Cras eu ante nisl. Vestibulum ut sagittis ex. Praesent et metus a ligula porta interdum.
        </p>
        <h2 id="gas-free">Gas Free</h2>
        <p>
          <img src={gasLessSignImg} alt="CowSwap - Gas Free Transactions" />
        </p>
        <p>
          Gas costs are accounted for in your sell token already - no gas costs need to be paid! CowSwap uses an
          off-chain design for submitting trades:
        </p>
        <ol>
          <li>You sign a trade message which is submitted to CowSwap’s off-chain service</li>
          <li>
            <p>CowSwap’s off-chain service optimizes your trade’s execution by considering:</p>
          </li>
          <li>
            <p>Coincidence Of Wants</p>
          </li>
          <li>Best execution route among AMMs (for the remaining amount)</li>
          <li>
            <p>Optimized gas price for inclusion in the next mined block</p>
          </li>
          <li>
            <p>Your trade is submitted and settled on-chain</p>
          </li>
        </ol>
        <p>
          Why? This helps you to save on gas, slippage &amp; protocol fees. You might receive a larger amount than
          anticipated :)
        </p>
      </Content>
    </Page>
  )
}
