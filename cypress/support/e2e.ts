// Import commands.js using ES2015 syntax:
import './commands'

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Global beforeEach hook for API testing setup
beforeEach(() => {
  // Set up API interceptors or database seeding if needed
  cy.intercept('GET', '/api/**').as('apiGet')
  cy.intercept('POST', '/api/**').as('apiPost')
  cy.intercept('PUT', '/api/**').as('apiPut')
  cy.intercept('DELETE', '/api/**').as('apiDelete')
})

// Global error handling
Cypress.on('uncaught:exception', (err, runnable) => {
  // Prevent Cypress from failing on uncaught exceptions
  // Return false to prevent the error from failing the test
  if (err.message.includes('ResizeObserver loop limit exceeded')) {
    return false
  }
  // You can add more specific error handling here
  return true
})