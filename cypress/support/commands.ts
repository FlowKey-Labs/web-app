// ***********************************************
// Custom Cypress commands
// ***********************************************

// -- Login command --
Cypress.Commands.add('login', (email: string, password: string) => {
  // Clear cookies and local storage before login
  cy.clearCookies();
  cy.clearLocalStorage();
  
  // Visit the login page with retry logic
  cy.visit('/login', {
    timeout: 60000,
    retryOnStatusCodeFailure: true,
    retryOnNetworkFailure: true
  });

  // Check if we're on the login page by looking for the email field
  cy.get('body').then(($body) => {
    // If we're already logged in, just return
    if ($body.find('[data-testid="user-menu"]').length > 0) {
      cy.log('Already logged in');
      return;
    }

    // Wait for the login form to be visible
    cy.get('input[name="email"]', { timeout: 10000 })
      .should('be.visible')
      .type(email);
      
    cy.get('input[name="password"]')
      .should('be.visible')
      .type(password, { log: false }); // Don't log the password
      
    cy.get('button[type="submit"]')
      .should('be.visible')
      .should('not.be.disabled')
      .click();

    // Wait for login to complete - adjust the selector to match your app
    cy.get('[data-testid="user-menu"]', { timeout: 20000 }).should('be.visible');
    
    // Ensure we're not on the login page anymore
    cy.url().should('not.include', '/login');
  });
});

// Add type definitions for custom commands
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable<Subject = any> {
      login(email: string, password: string): Chainable<void>;
    }
  }
}

export {};
