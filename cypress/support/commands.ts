/// <reference types="cypress" />

// Export an empty object to make this file a module
export {};

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to login via UI with session management
       * @example cy.login('admin@example.com', 'password123')
       */
      login(email?: string, password?: string): Chainable<void>;

      /**
       * Custom command to login via API (legacy)
       * @example cy.loginByApi('user@example.com', 'password')
       */
      loginByApi(email: string, password: string): Chainable<void>;

      /**
       * Custom command to make authenticated API requests
       * @example cy.apiRequest('GET', '/users/me')
       */
      apiRequest(method: string, url: string, body?: any): Chainable<any>;
    }
  }
}

// This export makes the file a module
export {};

Cypress.Commands.add('login', (email: string, password: string) => {
  cy.session([email, password], () => {
    cy.clearCookies();
    cy.clearLocalStorage();

    cy.visit('/login');

    cy.get('[data-cy=email-input]').type(email);
    cy.get('[data-cy=password-input]').type(`${password}{enter}`);

    // Wait for login to complete and verify navigation to dashboard
    cy.url().should('include', '/dashboard', { timeout: 30000 });
    cy.get('[data-cy=dashboard-main]', { timeout: 30000 }).should('be.visible');

    // Verify authentication state
    cy.window().then((win) => {
      expect(win.localStorage.getItem('accessToken')).to.exist;
      expect(win.localStorage.getItem('refresh')).to.exist;
    });
  });

  // After session is established, visit dashboard
  cy.visit('/dashboard');
  cy.get('[data-cy=dashboard-main]').should('be.visible');
});

Cypress.Commands.add(
  'apiRequest',
  (method: string, url: string, body?: any) => {
    const token = window.localStorage.getItem('accessToken');

    if (!token) {
      throw new Error('No access token found');
    }

    cy.request({
      method,
      url: `${Cypress.env('apiUrl')}/api${url}`,
      body,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  }
);
