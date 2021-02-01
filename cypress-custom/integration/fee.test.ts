import { ChainId, WETH } from '@uniswap/sdk'
import { FeeInformation } from '../../src/custom/state/fee/reducer'

const DAI = '0xc7AD46e0b8a400Bb3C915120d284AafbA8fc4735'
const RINKEBY = ChainId.RINKEBY.toString()
const FEE_QUERY = `https://protocol-rinkeby.dev.gnosisdev.com/api/v1/tokens/${WETH[4].address}/fee`
const FEE_QUOTES_LOCAL_STORAGE_KEY = 'redux_localstorage_simple_fee'

function _assertFeeData(fee: FeeInformation): void {
  expect(fee).to.have.property('minimalFee')
  expect(fee).to.have.property('feeRatio')
  expect(fee).to.have.property('expirationDate')
}

function _getLocalStorage(): Cypress.Chainable<Storage> {
  return cy.window().then(window => window.localStorage)
}

function _getChainFeeStorage(networkKey: string): Cypress.Chainable {
  return (
    _getLocalStorage()
      .its(FEE_QUOTES_LOCAL_STORAGE_KEY)
      // To properly return this we need .should and an expectation
      .should(feeQuotesStorage => {
        expect(JSON.parse(feeQuotesStorage)).to.have.property(networkKey)
      })
      .then(fee => JSON.parse(fee)[networkKey])
  )
}

function _assertFeeFetched(token: string): void {
  _getChainFeeStorage(RINKEBY).then(feeQuoteData => {
    expect(feeQuoteData).to.exist
    expect(feeQuoteData).to.have.property(token)

    // THEN: The quote has the expected information
    const fee = feeQuoteData[token].fee
    _assertFeeData(fee)
  })
}

xdescribe('Fee endpoint', () => {
  it('Returns the expected info', () => {
    // GIVEN: -
    // WHEN: Call fee API
    cy.request(FEE_QUERY)
      .its('body')
      // THEN: The API response has the expected data
      .should(_assertFeeData)
  })
})

describe('Fetch and persist fee', () => {
  beforeEach(() => {
    // set the Cypress clock to now
    // only override Date functions
    cy.clock(new Date().getTime(), ['Date'])
    cy.visit('/swap')
  })

  xit('Fetch fee automatically on load', () => {
    // GIVEN: An user loads the swap page
    // WHEN: He does nothing
    // THEN: The fee for ETH is fetched
    _assertFeeFetched('ETH')
  })

  xit('Fetch fee when selecting token', () => {
    // GIVEN: Clean local storage
    cy.clearLocalStorage()

    // WHEN: Select DAI token
    cy.swapSelectInput(DAI)

    // THEN: The fee for DAI is fetched
    _assertFeeFetched(DAI)
  })

  // TODO:
  // Difficult to test this as the fee is calculated in the backend
  // Backend fee calculation is totally unaware/doesn't care what the user's frontend Date time is
  // meaning any date manipulation here WILL trigger a date change from frontend "/custom/state/fees/updater.tsx",
  // but backend will not respect that manipulated time when recalculating
  // see https://github.com/gnosis/gp-v2-services/blob/537ca1856d270b698ca6c7950265198d85c009c7/orderbook/src/api/get_fee_info.rs#L28
  it('Re-fetched when it expires', () => {
    const TOKEN = 'ETH'
    const TIME_TO_ADVANCE_MS = 16200 * 1000

    // GIVEN: An expired fee is present in the local storage
    // Advance local FRONTEND time +4.5 hours
    cy.tick(TIME_TO_ADVANCE_MS)
    // WHEN: When the fee quote expires, we refetch the fee
    _getChainFeeStorage(RINKEBY).then($feeStorage => {
      console.log(`[FEE STORAGE]::[TEST]::[AFTER] => ${$feeStorage[TOKEN].fee.expirationDate}`)
    })
  })
})

xdescribe('Swap: Considering fee', () => {
  beforeEach(() => {
    // GIVEN: an initial selection of WETH-DAI
    cy.visit('/swap')
  })

  it("Uses Uniswap price, if there's no tip", () => {
    // GIVEN: Swap WETH-DAI
    // TODO: Create command for easy setting up a case (setup current selection)
    //
    // GIVEN: No fee
    // TODO: Create action for intercepting the API call
    //
    // WHEN: Users input amount
    //
    // THEN: He gets uniswap price
  })

  it("User can't trade when amount is smaller than minimumFee", () => {
    // GIVEN: Swap WETH-DAI
    //
    // GIVEN: amount is smaller than minimumFee
    //
    // WHEN: Users input amount
    //
    // THEN: He cannot trade
  })

  it('User pays minimumFee for small trades', () => {
    // GIVEN: Swap WETH-DAI
    //
    // GIVEN: amount is bigger than minimumFee, but trade is still small
    //
    // WHEN: Users input amount
    //
    // THEN: He gets Uniswap price minus minimal-trade
  })

  it('User pays more than minimumFee for big trades', () => {
    // GIVEN: Swap WETH-DAI
    //
    // GIVEN: amount * "fee factor" is bigger than minimumFee
    //
    // WHEN: Users input amount
    //
    // THEN: He gets Uniswap price minus amount * "fee factor"
  })
})
