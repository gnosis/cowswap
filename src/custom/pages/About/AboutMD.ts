import gasless from 'assets/cow-swap/gasless-sign.png'

export default `
# About

### (updated: April 2021)

## What is CowSwap?

** CowSwap ** is a Interdum et malesuada fames ac ante ipsum primis in faucibus. Proin vitae blandit leo. Etiam consequat diam eu tortor scelerisque mattis. Nulla eu lacus accumsan, consequat ante et, molestie ex. Cras eu ante nisl. Vestibulum ut sagittis ex. Praesent et metus a ligula porta interdum.

## Gas Free

![CowSwap - Gas Free Transactions](${gasless})

Gas costs are accounted for in your sell token already - no gas costs need to be paid! CowSwap uses an off-chain design for submitting trades:

1. You sign a trade message which is submitted to CowSwap’s off-chain service
2. CowSwap’s off-chain service optimizes your trade’s execution by considering:

- Coincidence Of Wants
- Best execution route among AMMs (for the remaining amount)
- Optimized gas price for inclusion in the next mined block

3. Your trade is submitted and settled on-chain

Why? This helps you to save on gas, slippage & protocol fees. You might receive a larger amount than anticipated :)

`.trim()
