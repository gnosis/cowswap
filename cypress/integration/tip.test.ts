import { Currency, CurrencyAmount, JSBI, Token, TokenAmount, Trade, WETH } from '@uniswap/sdk'
import { getFeeAmount } from '../../src/custom/utils/fee'
import { FeeInformation } from '../../src/custom/utils/operator'

const stringToCurrency = (amount: string, currency: Currency) =>
  currency instanceof Token ? new TokenAmount(currency, JSBI.BigInt(amount)) : CurrencyAmount.ether(JSBI.BigInt(amount))

// Assumptions:
// RINKEBY
const TYPED_AMOUNT = '12'
// DAI
const DAI_ADDRESS = '0xc7AD46e0b8a400Bb3C915120d284AafbA8fc4735'
const OUTPUT_TOKEN = new Token(4, DAI_ADDRESS, 18, 'DAI', 'DAI Stablecoin')

const FEE_QUERY = `https://protocol-rinkeby.dev.gnosisdev.com/api/v1/tokens/${WETH[4].address}/fee`
const SWAP_URL = '/swap'

describe('[EXACT-IN::SELL] :: ETH/DAI', () => {
  before(() => {
    cy.visit(SWAP_URL)
  })

  it('[UI] Selects DAI token', () => {
    // Open currency selector
    cy.get('#swap-currency-output .open-currency-select-button').click()
    cy.get(`.token-item-${OUTPUT_TOKEN.address}`).should(`be.visible`)
    // select DAI
    cy.get(`.token-item-${OUTPUT_TOKEN.address}`).click({ force: true })
    cy.get('#swap-currency-input .token-amount-input').should('be.visible')
    // input the cached input amount (above)
    cy.get('#swap-currency-input .token-amount-input').type(TYPED_AMOUNT, { force: true, delay: 200 })
    cy.get('#swap-currency-output .token-amount-input').should('not.equal', '')
  })

  context('[Trade + Fee Logic Tests] :: ETH/DAI', () => {
    beforeEach(() => {
      // set aliases in context to reuse
      // start fee request and alias as @fee
      cy.request(FEE_QUERY)
        .its('body')
        .as('fee')

      // Trade object and alias as @trade
      cy.window()
        .as('win')
        .its('trade')
        .as('trade')

      cy.get('#swap-currency-output .token-amount-input').as('output')

      // Clear the storage (old redux state etc)
      cy.get<Window>('@win').then(window => window.localStorage.clear())
    })

    it('[TRADE] Trade properties are correct', () => {
      cy.get<Trade>('@trade').should((trade: Trade) => {
        // Trade should have input/out amounts and executionPrice
        expect(trade).to.have.property('inputAmount')
        expect(trade).to.have.property('outputAmount')
        expect(trade).to.have.property('executionPrice')
      })

      cy.get<Trade>('@trade')
        .its('inputAmount')
        .should(inputAmount => {
          expect(inputAmount.toExact()).to.equal(TYPED_AMOUNT)
        })

      cy.get<Trade>('@trade').should(trade => {
        const { executionPrice, inputAmount } = trade
        // OUTPUT / PRICE = INPUT (as string)
        const calculatedOutputAmount = inputAmount.multiply(executionPrice).toSignificant(inputAmount.currency.decimals)
        expect(calculatedOutputAmount).to.not.be.null
        // cy.get('@output').should('equal', calculatedOutputAmount)
      })
    })

    it('[FEE] NO FEE', () => {
      cy.get<FeeInformation>('@fee').should(fee => {
        expect(fee).to.have.property('minimalFee', '0') // true
        expect(fee).to.have.property('feeRatio', 0) // true
      })

      // nested thens to access both fee/trade without using const/let
      cy.get<FeeInformation>('@fee').then(feeInformation => {
        cy.get<Trade>('@trade').then(trade => {
          // check that miimalFee isn't bigger than intput amount
          // if it is, we expect a null trade and stop
          const { inputAmount, outputAmount, executionPrice } = trade

          // can test with:
          // sellAmount: inputAmount.raw.toString()
          const fee = getFeeAmount({
            sellAmount: inputAmount.raw.toString(),
            ...feeInformation
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

          // input/output amounts should not be equal (ETH/DAI)
          expect(inputAmount.toExact()).to.not.equal(outputAmount.toExact())

          const expectedFee = amountWithFee.subtract(amountNoFee).toSignificant(inputAmount.currency.decimals)
          const calculatedFee = feeAsCurrency?.toSignificant(inputAmount.currency.decimals) || '0'

          expect(calculatedFee).to.equal(expectedFee)
        })
      })
    })
  })
})
