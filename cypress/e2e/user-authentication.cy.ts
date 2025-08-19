describe('Login', function () {
  const user = {
    email: Cypress.env('testEmail'),
    password: Cypress.env('testPassword'),
    name: 'Test User',
    id: 1,
    first_name: 'Test',
    last_name: 'User',
  };

  beforeEach(function () {
    cy.visit('/');
  });

  it('successfully logs in and loads the dashboard', function () {
    cy.login(user.email, user.password);
    cy.get('[data-cy=dashboard-main]').should('be.visible');
  });
});
