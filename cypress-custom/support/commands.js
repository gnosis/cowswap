Cypress.Commands.add('swapSelectInput', tokenAddress => {
  cy.get('#swap-currency-input .open-currency-select-button').click()
  cy.get('.token-item-' + tokenAddress).should('be.visible')
  cy.get('.token-item-' + tokenAddress).click({ force: true })
})

Cypress.Commands.add('stubResponse', ({ url, alias = 'stubbedResponse', body }) => {
  cy.route2(url, { body }).as(alias)
})
