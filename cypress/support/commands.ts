/// <reference types="cypress" />

// Custom command type definitions
declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to login via API with session management
       * @example cy.login('user@example.com', 'password')
       */
      login(email: string, password: string): Chainable<void>;

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

// New login command with session management
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.session([email, password], () => {
    cy.request({
      method: 'POST',
      url: `${Cypress.env('apiUrl') || 'http://localhost:8000'}/api/auth/login`,
      body: { email, password },
      failOnStatusCode: false
    }).then((response) => {
      if (response.status !== 200) {
        throw new Error(`Login failed: ${response.status} - ${JSON.stringify(response.body)}`);
      }
      // Store the auth state
      window.localStorage.setItem('authToken', response.body.token);
      window.localStorage.setItem('user', JSON.stringify(response.body.user));
    });
  });
  
  // Visit a page that requires auth to ensure session is established
  cy.visit('/dashboard');
});

// Legacy login command (for backward compatibility)
Cypress.Commands.add('loginByApi', (email: string, password: string) => {
  cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl') || 'http://localhost:8000'}/api/auth/login`,
    body: { email, password },
    failOnStatusCode: false
  }).then((response) => {
    expect(response.status).to.eq(200);
    // Store token in localStorage
    window.localStorage.setItem('authToken', response.body.token);
    window.localStorage.setItem('user', JSON.stringify(response.body.user));
  });
});

// Authenticated API request command
Cypress.Commands.add(
  'apiRequest',
  (method: string, url: string, body?: any) => {
    const token = window.localStorage.getItem('authToken');

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


