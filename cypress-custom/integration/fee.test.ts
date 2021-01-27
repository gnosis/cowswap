describe('Fee endpoint', () => {
  it('Returns the expected info', () => {
    // GIVEN:-
    // WHEN: Call fee API
    // cy.request('/users/1')
    //   .its('body')
    //   .should('deep.eq', { name: 'Jane' })
    //
    // THEN: The response has the expected information
  })
})

describe('Fetch and persist fee', () => {
  beforeEach(() => {
    cy.visit('/swap')
    // TODO: No fee
  })

  it('Persisted when selecting a token', () => {
    // GIVEN: A fee for a token is not in the local storage
    // WHEN: When the user select this token
    // THEN: The fee is persisted in the local storage (redux_localstorage_simple_fee)
  })

  // TODO: not sure if it's easy to test this
  it('Re-fetched when it expires', () => {
    // GIVEN: A fee is present in the local storage
    // WHEN: When the fee quote expires, we refetch the fee
    // THEN: We get another quote
  })
})

describe('Swap considers fee', () => {
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
    //
    // cy.get('#swap-currency-input .token-amount-input').type('0.001', { force: true, delay: 200 })
    // cy.get('#swap-currency-output .token-amount-input').should('not.equal', '')
    // cy.get('#swap-button').click()
  })

  it("Use can't trade when amount is smaller than minimumFee", () => {
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
