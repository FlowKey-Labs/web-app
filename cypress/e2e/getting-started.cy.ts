/// <reference types="cypress" />

Cypress.on('uncaught:exception', (err) => {
  if (err.message.includes('removeChild')) {
    console.log('Ignoring removeChild error from React');
    return false;
  }
  return true;
});

// Update mock endpoints to match actual API paths
const mockEndpoints = {
  analytics: {
    path: '/api/analytics*',
    response: {
      statusCode: 200,
      body: {
        total_sessions: 42,
        total_clients: 15,
        total_staff: 5,
        date_filter: 'to_date',
        gender_distribution: [
          { name: 'Male', value: 20 },
          { name: 'Female', value: 30 }
        ]
      },
    },
  },
  upcomingSessions: {
    path: '/api/sessions/upcoming*',
    response: {
      statusCode: 200,
      body: [
        {
          id: 1,
          title: 'Piano Lesson',
          client_name: 'John Doe',
          start_time: new Date(Date.now() + 3600000).toISOString(),
          end_time: new Date(Date.now() + 4200000).toISOString(),
          duration: 60,
          status: 'scheduled',
          staff: { name: 'John Instructor' },
          date: new Date().toISOString()
        },
      ],
    },
  },
  weeklyClients: {
    path: '/api/dashboard/weekly-clients*',
    response: {
      statusCode: 200,
      data: [
        { day: 'Mon', value: 10 },
        { day: 'Tue', value: 15 },
        { day: 'Wed', value: 12 },
        { day: 'Thu', value: 18 },
        { day: 'Fri', value: 20 },
        { day: 'Sat', value: 15 },
        { day: 'Sun', value: 22 }
      ]
    },
  },
  staff: {
    path: '/api/staff*',
    response: {
      statusCode: 200,
      body: [
        { 
          id: 1, 
          first_name: 'John', 
          last_name: 'Doe',
          email: 'john@example.com',
          phone_number: '+1234567890',
          role: 'instructor',
          active: true
        },
        { 
          id: 2, 
          first_name: 'Jane', 
          last_name: 'Smith',
          email: 'jane@example.com',
          phone_number: '+1987654321',
          role: 'admin',
          active: true
        },
      ],
    },
  },
  upcomingBirthdays: {
    path: '/api/dashboard/upcoming-birthdays*',
    response: {
      statusCode: 200,
      body: [
        { id: 1, name: 'John Client', date: '1990-08-25' },
        { id: 2, name: 'Jane Client', date: '1992-08-28' }
      ]
    }
  },
  categoryDistribution: {
    path: '/api/dashboard/category-distribution*',
    response: {
      statusCode: 200,
      body: [
        { name: 'Piano', value: 40 },
        { name: 'Guitar', value: 30 },
        { name: 'Violin', value: 20 },
        { name: 'Drums', value: 10 }
      ]
    }
  },
  cancellationAnalytics: {
    path: '/api/dashboard/cancellation-reschedule-analytics*',
    response: {
      statusCode: 200,
      body: {
        cancellations: 5,
        reschedules: 3,
        total_sessions: 100,
        cancellation_rate: 5,
        reschedule_rate: 3
      }
    }
  },
};

describe('Dashboard Analytics', () => {
  beforeEach(() => {
    // Mock all required API endpoints
    cy.intercept(
      'GET',
      mockEndpoints.analytics.path,
      mockEndpoints.analytics.response
    ).as('getAnalytics');

    cy.intercept(
      'GET',
      mockEndpoints.upcomingSessions.path,
      mockEndpoints.upcomingSessions.response
    ).as('getUpcomingSessions');

    cy.intercept(
      'GET',
      mockEndpoints.weeklyClients.path,
      mockEndpoints.weeklyClients.response
    ).as('getWeeklyClients');

    cy.intercept(
      'GET',
      mockEndpoints.staff.path,
      mockEndpoints.staff.response
    ).as('getStaff');

    cy.intercept(
      'GET',
      mockEndpoints.upcomingBirthdays.path,
      mockEndpoints.upcomingBirthdays.response
    ).as('getUpcomingBirthdays');

    cy.intercept(
      'GET',
      mockEndpoints.categoryDistribution.path,
      mockEndpoints.categoryDistribution.response
    ).as('getCategoryDistribution');

    cy.intercept(
      'GET',
      mockEndpoints.cancellationAnalytics.path,
      mockEndpoints.cancellationAnalytics.response
    ).as('getCancellationAnalytics');

    // Add other required mocks
    cy.intercept('GET', '/api/auth/profile*', {
      statusCode: 200,
      body: { id: 1, first_name: 'Test', last_name: 'User' },
    }).as('getProfile');
    cy.intercept('GET', '/api/booking/notifications*', {
      statusCode: 200,
      body: [],
    }).as('getNotifications');
    cy.intercept('GET', '/api/dashboard/sessions-per-staff*', {
      statusCode: 200,
      body: [],
    }).as('getSessionsPerStaff');
    cy.intercept('GET', '/api/dashboard/upcoming-birthdays*', {
      statusCode: 200,
      body: [],
    }).as('getUpcomingBirthdays');
    cy.intercept('GET', '/api/client/*', {
      statusCode: 200,
      body: { items: [], total: 0 },
    }).as('getClients');
    cy.intercept('GET', '/api/dashboard/category-distribution*', {
      statusCode: 200,
      body: [],
    }).as('getCategoryDistribution');
    cy.intercept('GET', '/api/dashboard/cancellation-reschedule-analytics*', {
      statusCode: 200,
      body: {},
    }).as('getCancellationAnalytics');

    // Get test credentials from environment variables
    const email = Cypress.env('testEmail');
    const password = Cypress.env('testPassword');

    if (!email || !password) {
      throw new Error(
        'Missing test credentials. Please set CYPRESS_TEST_EMAIL and CYPRESS_TEST_PASSWORD environment variables.'
      );
    }

    // Use cy.session to maintain login state
    cy.session([email, password], () => {
      cy.visit('/login');

      cy.get('input[type="email"]', { timeout: 10000 })
        .should('be.visible')
        .type(email);

      cy.get('input[type="password"]')
        .should('be.visible')
        .type(password, { log: false });

      cy.get('button[type="submit"]').should('be.visible').click();

      // Wait for dashboard to load
      cy.url({ timeout: 30000 })
        .should('include', '/dashboard')
        .then(() => {
          cy.get('body').should('be.visible');
        });
    });

    // Visit the dashboard and wait for initial data load
    cy.visit('/dashboard');
    cy.wait([
      '@getAnalytics',
      '@getUpcomingSessions',
      '@getWeeklyClients',
      '@getProfile',
      '@getNotifications',
      '@getSessionsPerStaff',
      '@getUpcomingBirthdays',
      '@getClients',
      '@getCategoryDistribution',
      '@getCancellationAnalytics',
      '@getStaff',
    ]);
  });

  it('should display dashboard analytics with correct data', () => {
    // Verify the dashboard title and welcome message
    cy.contains('Welcome back').should('be.visible');

    // Verify the analytics cards are displayed with correct data
    cy.contains('Total Sessions').should('be.visible');
    cy.contains('42').should('be.visible');
    cy.contains('Total Clients').should('be.visible');
    cy.contains('15').should('be.visible');
    cy.contains('Total Staff').should('be.visible');
    cy.contains('5').should('be.visible');

    // Verify the upcoming sessions section
    cy.contains('Upcoming Sessions').should('be.visible');
    cy.contains('Piano Lesson').should('be.visible');
    cy.contains('John Doe').should('be.visible');
    cy.contains('John Instructor').should('be.visible');

    // Verify the Clients Overview section
    cy.contains('Clients Overview').should('be.visible');
    
    // Verify the Weekly Clients chart
    cy.contains('Weekly Clients').should('be.visible');
    
    // Verify the Sessions per Staff section
    cy.contains('Sessions per Staff').should('be.visible');
    
    // Verify the Upcoming Birthdays section
    cy.contains('Upcoming Birthdays').should('be.visible');
    
    // Verify the Category Distribution section
    cy.contains('Category Distribution').should('be.visible');
    
    // Verify the Cancellations & Reschedules section
    cy.contains('Cancellations & Reschedules').should('be.visible');
  });

  it('should refresh data when date filter changes', () => {
    const newFilter = 'last_7_days';
    const updatedAnalytics = {
      ...mockEndpoints.analytics.response.body,
      total_sessions: 35,
      total_clients: 12,
      date_filter: newFilter,
    };

    // Intercept the filtered analytics request
    cy.intercept('GET', `/api/analytics*range=${newFilter}*`, {
      statusCode: 200,
      body: updatedAnalytics,
    }).as('getFilteredData');

    // Change the date filter
    cy.get('.mantine-Select-input').click();
    cy.contains('Last 7 Days').click();

    // Wait for the filtered data to load
    cy.wait('@getFilteredData').then((interception) => {
      expect(interception.request.url).to.include(`range=${newFilter}`);

      // Verify the UI updates with new data
      cy.contains('35').should('be.visible');
      cy.contains('12').should('be.visible');
    });
  });

  it('should handle API errors gracefully', () => {
    // Intercept and force an error response
    cy.intercept('GET', '/api/analytics*', {
      statusCode: 500,
      body: { error: 'Internal server error' },
    }).as('getAnalyticsError');

    // Visit dashboard to trigger the error
    cy.visit('/dashboard');

    // Verify error handling (adjust based on your error UI)
    cy.contains('Error loading analytics').should('be.visible');
  });
});
