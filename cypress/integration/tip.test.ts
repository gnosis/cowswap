import { ChainId, Currency, CurrencyAmount, ETHER, JSBI, Token, TokenAmount, Trade, WETH } from '@uniswap/sdk'
import { getFeeAmount } from '../../src/custom/utils/fee'

function checkIfEther(tokenAddress: string, chainId: ChainId) {
  let checkedAddress = tokenAddress
  if (tokenAddress === ETHER.symbol) {
    checkedAddress = WETH[chainId].address
  }

  return checkedAddress
}

const stringToCurrency = (amount: string, currency: Currency) =>
  currency instanceof Token ? new TokenAmount(currency, JSBI.BigInt(amount)) : CurrencyAmount.ether(JSBI.BigInt(amount))

// Assumptions:
// RINKEBY
// SELL: ETH
// BUY: DAI
const DAI = '0xc7AD46e0b8a400Bb3C915120d284AafbA8fc4735'
const INPUT_TOKEN = 'ETH'
const OUTPUT_TOKEN = DAI

const INPUT_AMOUNT = '10'
const FEE_QUERY = `https://protocol-rinkeby.dev.gnosisdev.com/api/v1/tokens/${checkIfEther(INPUT_TOKEN, 4)}/fee`
const SWAP_URL = `/swap?inputCurrency=${INPUT_TOKEN}&outputCurrency=${OUTPUT_TOKEN}`

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

  it('Swap ETH for DAI and applies fee', () => {
    // Open currency selector
    cy.get('#swap-currency-output .open-currency-select-button').click()
    cy.get(`.token-item-${DAI}`).should(`be.visible`)
    // select DAI
    cy.get(`.token-item-${DAI}`).click({ force: true })
    cy.get('#swap-currency-input .token-amount-input').should('be.visible')
    // input the cached input amount (above)
    cy.get('#swap-currency-input .token-amount-input').type(INPUT_AMOUNT, { force: true, delay: 200 })
    cy.get('#swap-currency-output .token-amount-input').should('not.equal', '')

    cy.wait(2500).then(() => {
      // check fee
      cy.request(FEE_QUERY).then(response => {
        // we expect a returned fee amount
        expect(response).to.have.property('body')
        expect(response.body).to.have.property('minimalFee') // true
        expect(response.body).to.have.property('feeRatio') // true
        expect(response.body).to.have.property('expirationDate') // true

        // check trade exists
        cy.window()
          .its('trade')
          .should('not.equal', null)

        cy.window().then((win: any) => {
          const trade: Trade = win.trade
          const { inputAmount, outputAmount, executionPrice } = trade

          // can test with:
          // minimalFee: (20 * 10 ** 18).toString(),
          // feeRatio: 9000,
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
        })
      })
    })
  })
})
