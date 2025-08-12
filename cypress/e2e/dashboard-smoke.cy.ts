// Test data
const mockUser = {
  id: 1,
  first_name: 'Test',
  last_name: 'User',
  email: 'martokhago@gmail.com',
  role: 'admin',
  timezone: 'Africa/Nairobi'
};

describe('Dashboard Smoke Tests', () => {
  beforeEach(() => {
    // Clear any existing data
    cy.clearCookies();
    cy.clearLocalStorage();

    // Set auth state
    cy.window().then((win) => {
      win.localStorage.setItem('authToken', 'test-jwt-token');
      win.localStorage.setItem('user', JSON.stringify(mockUser));
    });
  });

  it('should load the dashboard', () => {
    // Mock minimal API responses
    cy.intercept('GET', '/api/auth/profile', {
      statusCode: 200,
      body: mockUser
    }).as('getProfile');

    cy.intercept('GET', '/api/analytics*', {
      statusCode: 200,
      body: {
        total_sessions: 42,
        total_clients: 15,
        total_staff: 5,
        upcoming_sessions: [],
        weekly_clients: [10, 15, 12],
        date_filter: 'to_date'
      }
    }).as('getAnalytics');

    // Visit dashboard
    cy.visit('/dashboard');
    
    // Basic assertions
    cy.contains('h1', 'Welcome back, Test').should('be.visible');
    cy.contains('Total Sessions').should('be.visible');
  });
});
