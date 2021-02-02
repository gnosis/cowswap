/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable<Subject> {
    /**
     * Select token input in the swap page
     *
     * @example cy.selectTokens()
     */
    swapSelectInput(tokenAddress: string): Chainable<Subject>

    /**
     * Set a stubbing intercept on route specified
     *
     * @example cy.swapStubResponse({ query: '/api/v1/someEndpoint/', alias: 'endpoint', body: { foo: 'foo' } })
     */
    swapStubResponse({ query, alias, body }: { query: string; alias?: string; body?: any }): Chainable<Subject>
  }
}
