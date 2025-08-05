describe('App Smoke Test', () => {
  it('should load the application', () => {
    // Visit the root URL (will use baseUrl from config)
    cy.visit('/', {
      timeout: 30000,
      failOnStatusCode: false
    });

    // Basic page checks
    cy.url().should('include', '/');
    cy.get('body').should('exist');
    
    // Check for common elements
    cy.get('body').then(($body) => {
      if ($body.find('h1, h2, h3').length > 0) {
        cy.log('✅ Found heading elements');
      } else {
        cy.log('Page content:', $body.text().substring(0, 200));
      }
    });
  });
});
