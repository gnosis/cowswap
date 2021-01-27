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
