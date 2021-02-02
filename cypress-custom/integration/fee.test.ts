import { ChainId, WETH } from '@uniswap/sdk'
import { FeeInformation, FeeInformationObject } from '../../src/custom/state/fee/reducer'

const DAI = '0xc7AD46e0b8a400Bb3C915120d284AafbA8fc4735'
const RINKEBY = ChainId.RINKEBY.toString()
const FEE_QUERY = `https://protocol-rinkeby.dev.gnosisdev.com/api/v1/tokens/${WETH[4].address}/fee`
const FEE_QUOTES_LOCAL_STORAGE_KEY = 'redux_localstorage_simple_fee'
const FOUR_HOURS = 3600 * 4 * 1000

function _assertFeeData(fee: FeeInformation, [minimalFee, feeRatio, expirationDate]: (string | number)[] = []): void {
  // Allows use to assert not only it exists but that it can now accept expected property values
  minimalFee ? expect(fee).to.have.property('minimalFee', minimalFee) : expect(fee).to.have.property('minimalFee')
  feeRatio ? expect(fee).to.have.property('feeRatio', feeRatio) : expect(fee).to.have.property('feeRatio')
  expirationDate
    ? expect(fee).to.have.property('expirationDate', expirationDate)
    : expect(fee).to.have.property('expirationDate')
}

function _getLocalStorage(): Cypress.Chainable<Storage> {
  return cy.window().then(window => window.localStorage)
}

function _getChainFeeStorage(
  networkKey: string,
  token?: string
): Cypress.Chainable<{ [t: string]: FeeInformationObject }> {
  return (
    _getLocalStorage()
      .its(FEE_QUOTES_LOCAL_STORAGE_KEY)
      // To properly return this we need .should and an expectation
      .should(feeQuotesStorage => {
        expect(JSON.parse(feeQuotesStorage)).to.have.property(networkKey)
        token && expect(JSON.parse(feeQuotesStorage)[RINKEBY]).to.have.property(token)
      })
      .then(fee => JSON.parse(fee)[networkKey])
  )
}

function _assertFeeFetched(token: string): Cypress.Chainable {
  return _getChainFeeStorage(RINKEBY, token).then(feeQuoteData => {
    expect(feeQuoteData).to.exist
    expect(feeQuoteData).to.have.property(token)

    // THEN: The quote has the expected information
    const fee = feeQuoteData[token].fee
    _assertFeeData(fee)
  })
}

describe('Fee endpoint', () => {
  it('Returns the expected info', () => {
    // GIVEN: -
    // WHEN: Call fee API
    cy.request(FEE_QUERY)
      .its('body')
      // THEN: The API response has the expected data
      .should(_assertFeeData)
  })
})

describe('Fee: Complex fetch and persist fee', () => {
  // Needs to run first to pass because of Cypress async issues between tests
  it('Re-fetched when it expires', () => {
    // GIVEN: input token Fee expiration is always 6 hours from now
    const SIX_HOURS = FOUR_HOURS * 1.5
    const LATER_TIME = new Date(Date.now() + SIX_HOURS).toISOString()
    const LATER_FEE = {
      expirationDate: LATER_TIME,
      minimalFee: '0',
      feeRatio: 0
    }

    // set the Cypress clock to now (default is UNIX 0)
    // only override Date functions (default is to override all time based functions)
    cy.clock(Date.now(), ['Date'])
    cy.stubResponse({ url: FEE_QUERY, alias: 'feeRequest', body: LATER_FEE })

    // GIVEN: user visits app and goes AFK
    cy.visit('/swap')

    // WHEN: The user comes back 4h later (so the fee quote is expired) (after a long sandwich eating sesh, dude was hungry)
    cy.tick(FOUR_HOURS).then($clock => {
      // Stub the API fee response to return LATER_FEE

      // THEN: a new fee request is made AHEAD of current (advanced) time
      cy.wait('@feeRequest')
        .its('response.body')
        .then($body => {
          const body = JSON.parse($body)
          // @ts-expect-error - cypress untyped method
          const mockedTime = new Date($clock.details().now)

          // THEN: fee time is properly stubbed and
          expect(body.expirationDate).to.equal(LATER_TIME)
          // THEN: the mocked later date is indeed less than the new fee (read: the fee is valid)
          expect(new Date(body.expirationDate)).to.be.greaterThan(mockedTime)
        })
    })
  })
})

describe('Fee: simple checks it exists', () => {
  beforeEach(() => {
    cy.visit('/app')
  })
  it('Fetch fee automatically on load', () => {
    // GIVEN: A user loads the swap page
    // WHEN: He does nothing
    // THEN: The fee for ETH is fetched
    _assertFeeFetched('ETH')
  })

  it('Fetch fee when selecting token', () => {
    // GIVEN: A user loads the swap page
    // WHEN: Select DAI token
    cy.swapSelectToken(DAI, 'input')

    // THEN: The fee for DAI is fetched
    _assertFeeFetched(DAI)
  })
})

describe('Swap: Considering fee', () => {
  const DAI_QUERY = `https://protocol-rinkeby.dev.gnosisdev.com/api/v1/tokens/${DAI}/fee`

  beforeEach(() => {
    // GIVEN: an initial selection of WETH-DAI
    cy.visit('/swap')
  })

  it("Uses Uniswap price, if there's no tip", () => {
    // GIVEN: No fee
    // Setup the stub on fee queries
    const ZERO_FEE = {
      // pass later date to not trigger refetch
      expirationDate: new Date(Date.now() + FOUR_HOURS).toISOString(),
      minimalFee: '0',
      feeRatio: 0
    }
    // Set up stubbing on any calls to token fee API using passed in fee arg as response
    // Visit app and get test started
    cy.stubResponse({ url: DAI_QUERY, alias: 'feeRequest', body: ZERO_FEE })

    // GIVEN: Swap WETH-DAI
    cy.swapSelectToken(DAI, 'input')
    cy.swapSelectToken('ETHER', 'output')

    // We need to wait here for the API request to go out AFTER the user selects DAI as an input token
    // as the app is programmed to detect inputToken change and fetch fee
    cy.wait('@feeRequest')
      .its('response.body')
      // THEN: The API response has the expected data
      .then($body => _assertFeeData(JSON.parse($body), ['0', 0]))

    // WHEN: Users input amount
    cy.swapInputCheckOutput({
      inputName: '#swap-currency-input .token-amount-input',
      outputName: '#swap-currency-output .token-amount-input',
      typedAmount: '0.01',
      // THEN: He gets uniswap price
      expectedOutput: '0.01'
    })
  })

  xit("User can't trade when amount is smaller than minimumFee", () => {
    // GIVEN: 5 minimum fee
    // Setup the stub on fee queries
    const FEE = {
      expirationDate: new Date().toISOString(),
      minimalFee: '5',
      feeRatio: 0
    }
    // Set up stubbing on any calls to token fee API using passed in fee arg as response
    // Visit app and get test started
    cy.stubResponse({ url: DAI_QUERY, alias: 'fee', body: FEE })

    // GIVEN: Swap WETH-DAI
    cy.swapSelectToken(DAI, 'input')
    cy.swapSelectToken('ETHER', 'output')

    // cy.swapInputCheckOutput({
    //   inputName: '#swap-currency-input .token-amount-input',
    //   outputName: '#swap-currency-output .token-amount-input',
    //   // GIVEN: amount is smaller than minimumFee
    //   // WHEN: Users input amount
    //   typedAmount: '0.01',
    //   // THEN: He cannot trade
    //   expectedOutput: ''
    // })
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
