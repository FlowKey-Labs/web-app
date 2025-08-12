describe('Login', () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.intercept('GET', '/api/auth/profile', {
      statusCode: 200,
      body: {
        id: 1,
        email: 'martokhago@gmail.com',
        name: 'Test User',
        first_name: 'Test',
        last_name: 'User',
      },
    }).as('getProfile');
    cy.visit('/login');
    cy.get('body').should('be.visible');
  });

  it('should login successfully with valid credentials', () => {
    // Intercept dashboard APIs BEFORE login is submitted!
    cy.intercept('GET', /\/api\/analytics([\/?].*)?$/, {
      statusCode: 200,
      body: { total_sessions: 1, total_clients: 1, total_staff: 1 },
    }).as('getAnalytics');
    cy.intercept('GET', /\/api\/clients([\/?].*)?$/, {
      statusCode: 200,
      body: { items: [], total: 0, page: 1, pageSize: 6, totalPages: 1 },
    }).as('getClients');
    cy.intercept('GET', /\/api\/sessions([\/?].*)?$/, {
      statusCode: 200,
      body: [],
    }).as('getSessions');
    cy.intercept('GET', /\/api\/weekly-clients([\/?].*)?$/, {
      statusCode: 200,
      body: [],
    }).as('getWeeklyClients');
    cy.intercept('GET', /\/api\/category-distribution([\/?].*)?$/, {
      statusCode: 200,
      body: { categories: [], total_sessions: 0 },
    }).as('getCategoryDistribution');
    cy.intercept('GET', /\/api\/upcoming-birthdays([\/?].*)?$/, {
      statusCode: 200,
      body: { upcoming_birthdays: [] },
    }).as('getUpcomingBirthdays');
    cy.intercept('GET', /\/api\/cancellation-reschedule-analytics([\/?].*)?$/, {
      statusCode: 200,
      body: {},
    }).as('getCancellationRescheduleAnalytics');

    cy.intercept('POST', '/api/auth/login', {
      statusCode: 200,
      body: {
        user: {
          id: 1,
          email: 'martokhago@gmail.com',
          name: 'Test User',
        },
        token: 'fake-jwt-token',
      },
      headers: {
        Authorization: 'Bearer fake-jwt-token',
      },
    }).as('loginRequest');

    // Fill and submit login form
    cy.get('[data-cy=email-input]').type('martokhago@gmail.com');
    cy.get('[data-cy=password-input]').type('Paypal0!');
    cy.get('[data-cy=login-submit]').click();

    cy.wait('@loginRequest');
    cy.wait('@getProfile');

    // Wait for all dashboard data
    cy.wait('@getAnalytics');
    cy.wait('@getClients');
    cy.wait('@getSessions');
    cy.wait('@getWeeklyClients');
    cy.wait('@getCategoryDistribution');
    cy.wait('@getUpcomingBirthdays');
    cy.wait('@getCancellationRescheduleAnalytics');

    cy.get('[data-cy=dashboard-main]', { timeout: 50000 }).should('be.visible');
  });
});
