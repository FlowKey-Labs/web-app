/// <reference types="cypress" />

describe('Policy Management', () => {
  const testUser = {
    email: 'martokhago@gmail.com',
    password: 'Paypal0!'
  };

  before(() => {
    // Clear any existing sessions
    cy.clearCookies();
    cy.clearLocalStorage();
    
    // Login once before all tests
    cy.login(testUser.email, testUser.password);
  });

  it('should create a new policy', function() {
    // Set a longer timeout for this test
    this.timeout(120000);
    
    // Visit the policies page
    cy.visit('/policies');
    
    // Load test data
    cy.fixture('policy').then((policyData) => {
      const uniquePolicyName = `Test Policy ${Date.now()}`;
      
      // Click the create button
      cy.get('[data-testid="create-policy-button"]')
        .should('be.visible')
        .click();
      
      // Fill in the form
      cy.get('input[name="policyName"]')
        .should('be.visible')
        .type(uniquePolicyName);
      
      // Submit the form
      cy.get('button[type="submit"]')
        .should('be.visible')
        .click();
      
      // Verify success
      cy.contains('Policy created successfully', { timeout: 20000 })
        .should('be.visible');
      
      // Verify the policy appears in the list
      cy.contains(uniquePolicyName).should('exist');
    });
  });
});
