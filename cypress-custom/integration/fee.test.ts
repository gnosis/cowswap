import { ChainId, WETH } from '@uniswap/sdk'

const FEE_QUERY = `https://protocol-rinkeby.dev.gnosisdev.com/api/v1/tokens/${WETH[4].address}/fee`

describe('Fee endpoint', () => {
  it('Returns the expected info', () => {
    // GIVEN:-
    // WHEN: Call fee API
    cy.request(FEE_QUERY)
      .its('body')
      // THEN: response is as expected
      .should(body => {
        expect(body).to.have.property('minimalFee')
        expect(body).to.have.property('feeRatio')
        expect(body).to.have.property('expirationDate')
      })
  })
})

describe('Fetch and persist fee', () => {
  beforeEach(() => {
    cy.visit('/swap')

    // Alias localStorage
    cy.window()
      .then(window => window.localStorage)
      .as('localStorage')
  })

  it('Persisted when selecting a token', () => {
    const TOKEN = 'ETH'
    const NETWORK = ChainId.RINKEBY.toString()
    // GIVEN: A fee for a token is not in the local storage
    // WHEN: When the user select this token

    // Clear localStorage
    cy.get<Storage>('@localStorage').then(storage => storage.clear())

    // THEN: The fee is persisted in the local storage (redux_localstorage_simple_fee)
    cy.get<Storage>('@localStorage')
      .its('redux_localstorage_simple_fee')
      .should($feeStorage => {
        // we need to parse JSON
        const feeStorage = JSON.parse($feeStorage)
        const feeQuote = feeStorage[NETWORK][TOKEN]
        expect(feeStorage).to.have.property(NETWORK)
        expect(feeStorage[NETWORK]).to.have.property(TOKEN)
        expect(feeQuote.token).to.equal(TOKEN)
        expect(feeQuote.fee).to.have.property('minimalFee')
        expect(feeQuote.fee).to.have.property('feeRatio')
        expect(feeQuote.fee).to.have.property('expirationDate')
      })
  })

  // TODO: not sure if it's easy to test this
  it('Re-fetched when it expires', () => {
    const NETWORK = ChainId.RINKEBY.toString()
    const TOKEN = 'ETH'
    const KEY = 'redux_localstorage_simple_fee'
    const VALUE = JSON.stringify({
      [NETWORK]: {
        [TOKEN]: {
          fee: {
            minimalFee: '777',
            feeRatio: 777,
            expirationDate: new Date(Date.now() - 200000).toISOString()
          },
          token: TOKEN
        }
      }
    })
    // GIVEN: A fee is present in the local storage
    // Set expiring fee in localStorage
    cy.get<Storage>('@localStorage')
      .then($storage => {
        // set time in the past
        $storage.setItem(KEY, VALUE)
      })
      .its(KEY)
      // Keep retrying until localStorage is populated from app
      .should($feeStorage => expect($feeStorage).to.have.property(NETWORK))
      // Check that fee is currently in the PAST
      .then($feeStorage => {
        // we need to parse JSON
        const feeStorage = JSON.parse($feeStorage)
        const NOW = new Date()
        const feeExpirationDate = new Date(feeStorage[NETWORK].ETH.fee.expirationDate)

        // Here we expect the current saved expirationDate to be in the PAST
        expect(NOW).to.be.greaterThan(feeExpirationDate)
      })
      // WHEN: When the fee quote expires, we refetch the fee
      // better imo than using cy.wait - clear fee storage
      .then(() => cy.get<Storage>('@localStorage').then($storage => $storage.removeItem(KEY)))
      .its(KEY)
      // THEN: We get another quote
      .should($feeStorage => {
        const feeStorage = JSON.parse($feeStorage)

        const NOW = new Date()
        const feeExpirationDate = new Date(feeStorage[NETWORK].ETH.fee.expirationDate)
        expect(feeExpirationDate).to.be.greaterThan(NOW)
      })
  })
})

describe('Swap: Considering fee', () => {
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
