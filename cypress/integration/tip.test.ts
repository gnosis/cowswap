import { Currency, CurrencyAmount, JSBI, Token, TokenAmount, Trade, WETH } from '@uniswap/sdk'
import { parseUnits } from 'ethers/lib/utils'
import { getFeeAmount } from '../../src/custom/utils/fee'

const stringToCurrency = (amount: string, currency: Currency) =>
  currency instanceof Token ? new TokenAmount(currency, JSBI.BigInt(amount)) : CurrencyAmount.ether(JSBI.BigInt(amount))

// Assumptions:
// RINKEBY
const TYPED_AMOUNT = '12'
// ETH
const INPUT_CURRENCY = CurrencyAmount.ether(parseUnits(TYPED_AMOUNT, 18).toString())
// DAI
const DAI_ADDRESS = '0xc7AD46e0b8a400Bb3C915120d284AafbA8fc4735'
const OUTPUT_TOKEN = new Token(4, DAI_ADDRESS, 18, 'DAI', 'DAI Stablecoin')

const FEE_QUERY = `https://protocol-rinkeby.dev.gnosisdev.com/api/v1/tokens/${WETH[4].address}/fee`
const SWAP_URL = '/'

describe('Swap::Trade::Tip', () => {
  beforeEach(() => {
    cy.visit(SWAP_URL)
  })

  it('Fee query available', () => {
    cy.request(FEE_QUERY).then(response => {
      expect(response).to.have.property('body')
      expect(response.body).to.have.property('minimalFee') // true
      expect(response.body).to.have.property('feeRatio') // true
      expect(response.body).to.have.property('expirationDate') // true
    })
  })

  it('[EXACT-IN::SELL] Swap ETH for DAI and applies fee', () => {
    // Open currency selector
    cy.get('#swap-currency-output .open-currency-select-button').click()
    cy.get(`.token-item-${OUTPUT_TOKEN.address}`).should(`be.visible`)
    // select DAI
    cy.get(`.token-item-${OUTPUT_TOKEN.address}`).click({ force: true })
    cy.get('#swap-currency-input .token-amount-input').should('be.visible')
    // input the cached input amount (above)
    cy.get('#swap-currency-input .token-amount-input').type(TYPED_AMOUNT, { force: true, delay: 200 })
    cy.get('#swap-currency-output .token-amount-input').should('not.equal', '')

    // wait to get the trade object after inputting 2 tokens and an amount
    cy.wait(1000).then(() => {
      // check fee
      cy.request(FEE_QUERY).then(response => {
        cy.window().then((win: any) => {
          const trade: Trade = win.trade

          // TODO: remove
          // const mockFee = {
          //   minimalFee: (10 * 10 ** 18).toString(),
          //   feeRatio: 6000
          // }

          // Fee > inputAmount?
          const invalidTrade = JSBI.greaterThan(JSBI.BigInt(response.body.minimalFee), JSBI.BigInt(INPUT_CURRENCY.raw))

          // check that miimalFee isn't bigger than intput amount
          // if it is, we expect a null trade and stop
          if (invalidTrade) {
            expect(trade).to.be.null
          } else {
            const { inputAmount, outputAmount, executionPrice } = trade

            // can test with:
            // sellAmount: inputAmount.raw.toString()
            const fee = getFeeAmount({
              sellAmount: inputAmount.raw.toString(),
              ...response.body
            })

            // get the fee as a CurrencyAmount
            const feeAsCurrency = stringToCurrency(fee, inputAmount.currency)

            // get the inputAmount without any fee
            const amountNoFee = outputAmount.divide(executionPrice)
            // add the feeAsCurrency to amountNoFee to determine fee amount
            const amountWithFee = amountNoFee.add(feeAsCurrency?.toExact() || '0')

            // amount with and without fee should not be null
            expect(amountNoFee.toSignificant(inputAmount.currency.decimals)).to.not.be.null
            expect(amountWithFee.toSignificant(inputAmount.currency.decimals)).to.not.be.null

            // Trade should have input/out amounts
            expect(trade).to.have.property('inputAmount')
            expect(trade).to.have.property('outputAmount')

            // input/output amounts should not be equal (ETH/DAI)
            expect(inputAmount.toExact()).to.not.equal(outputAmount.toExact())

            // Subtract amountNoFee from amountWithFee to get the feeAmount
            expect(amountWithFee.subtract(amountNoFee).toSignificant(inputAmount.currency.decimals)).to.equal(
              feeAsCurrency?.toSignificant(inputAmount.currency.decimals) || '0'
            )
          }
        })
      })
    })
  })
})
