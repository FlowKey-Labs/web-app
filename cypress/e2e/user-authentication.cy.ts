describe('Login', function () {
  const user = {
    email: 'martokhago@gmail.com',
    password: 'Paypal0!',
    name: 'Test User',
    id: 1,
    first_name: 'Test',
    last_name: 'User',
  };

  beforeEach(function () {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.intercept('GET', '/api/auth/profile', {
      statusCode: 200,
      body: {
        id: user.id,
        email: user.email,
        name: user.name,
        first_name: user.first_name,
        last_name: user.last_name,
      },
    }).as('getProfile');

    // Dashboard intercepts
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

    cy.visit('/login');
    cy.get('body').should('be.visible');
  });

  it('sets auth token and loads dashboard on login', function () {
    cy.intercept('POST', '/api/auth/login', {
      statusCode: 200,
      body: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        token: 'fake-jwt-token',
      },
      headers: {
        Authorization: 'Bearer fake-jwt-token',
      },
    }).as('loginRequest');

    cy.get('[data-cy=email-input]').type(user.email);
    cy.get('[data-cy=password-input]').type(`${user.password}{enter}`);

    cy.wait('@loginRequest');
    cy.wait('@getProfile');
    cy.wait('@getAnalytics');
    cy.wait('@getClients');
    cy.wait('@getSessions');
    cy.wait('@getWeeklyClients');
    cy.wait('@getCategoryDistribution');
    cy.wait('@getUpcomingBirthdays');
    cy.wait('@getCancellationRescheduleAnalytics');

    cy.url().should('include', '/dashboard');
    cy.get('[data-cy=dashboard-main]', { timeout: 50000 }).should('be.visible');
    cy.window().its('localStorage.authToken').should('exist');
    cy.contains(user.name).should('exist');
  });
});
