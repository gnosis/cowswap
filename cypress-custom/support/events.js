const ETHERS_EXPECTED_ERROR = 'could not detect network (event="noNetwork"'

Cypress.on('uncaught:exception', (err) => {
  // we expect a 3rd party library error with message 'list not defined'
  // and don't want to fail the test so we return false
  if (err.message.includes(ETHERS_EXPECTED_ERROR)) {
    return false
  }
  // we still want to ensure there are no other unexpected
  // errors, so we let them fail the test
})
