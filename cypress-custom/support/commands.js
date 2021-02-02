Cypress.Commands.add('swapSelectToken', (tokenAddress, type = 'input') => {
  cy.get(`#swap-currency-${type} .open-currency-select-button`).click()
  cy.get('.token-item-' + tokenAddress).should('be.visible')
  cy.get('.token-item-' + tokenAddress).click({ force: true })
})

Cypress.Commands.add('swapInputCheckOutput', ({ inputName, outputName, typedAmount, expectedOutput }) => {
  cy.get(inputName)
    .should('exist')
    .type(typedAmount, { force: true, delay: 200 })
  cy.get(outputName)
    .should('exist')
    .should('have.value', expectedOutput)
})

function _responseHandlerFactory(body) {
  return req =>
    req.reply(res => {
      const newBody = JSON.stringify(body || res.body)
      res.body = newBody
    })
}

Cypress.Commands.add('stubResponse', ({ url, alias = 'stubbedResponse', body }) => {
  cy.route2({ method: 'GET', url }, _responseHandlerFactory(body)).as(alias)
})

Cypress.Commands.add('stubAndVisit', ({ query, alias = 'stubbedResponse', body, visit = '/' }) => {
  cy.swapStubResponse({ query, alias, body, visit })
  cy.visit(visit)
})
