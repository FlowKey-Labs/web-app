// Test data
const testUser = {
  id: 1,
  first_name: 'Test',
  last_name: 'User',
  email: 'martokhago@gmail.com',
  role: 'admin',
  timezone: 'Africa/Nairobi'
};

const testPassword = 'Paypal0!';

const mockAnalytics = {
  total_sessions: 42,
  total_clients: 15,
  total_staff: 5,
  upcoming_sessions: [
    {
      id: 1,
      title: 'Piano Lesson',
      client_name: 'John Doe',
      start_time: new Date(Date.now() + 3600000).toISOString(),
      duration: 60,
      status: 'scheduled'
    }
  ],
  weekly_clients: [10, 15, 12, 18, 20, 15, 22],
  date_filter: 'to_date'
};

const mockClients = {
  items: [
    {
      id: 1,
      first_name: 'John',
      last_name: 'Doe',
      email: 'john@example.com',
      phone_number: '+1234567890',
      active: true,
      created_at: new Date().toISOString()
    }
  ],
  total: 1,
  page: 1,
  pageSize: 6,
  totalPages: 1
};

describe('GettingStarted Dashboard', () => {
  beforeEach(() => {
    // Clear any existing data
    cy.clearCookies();
    cy.clearLocalStorage();

    // Mock login endpoint
    cy.intercept('POST', '/api/auth/login', {
      statusCode: 200,
      body: {
        user: testUser,
        token: 'test-jwt-token'
      }
    }).as('loginRequest');

    // Mock profile endpoint
    cy.intercept('GET', '/api/auth/profile', {
      statusCode: 200,
      body: testUser
    }).as('getProfile');

    // Mock analytics endpoints
    cy.intercept('GET', '/api/analytics*', (req) => {
      if (req.url.includes('weekly-clients')) {
        return req.reply({
          statusCode: 200,
          body: mockAnalytics.weekly_clients
        });
      }
      if (req.url.includes('upcoming-sessions')) {
        return req.reply({
          statusCode: 200,
          body: mockAnalytics.upcoming_sessions
        });
      }
      // Default analytics response
      return req.reply({
        statusCode: 200,
        body: {
          total_sessions: mockAnalytics.total_sessions,
          total_clients: mockAnalytics.total_clients,
          total_staff: mockAnalytics.total_staff,
          date_filter: mockAnalytics.date_filter
        }
      });
    }).as('getAnalytics');

    // Mock clients endpoint
    cy.intercept('GET', '/api/client*', {
      statusCode: 200,
      body: mockClients
    }).as('getClients');

    // Login before each test
    cy.login(testUser.email, testPassword);
    
    // Wait for initial data to load
    cy.wait(['@getAnalytics']);
  });

  it('should display welcome message with user name', () => {
    cy.contains('h1', 'Welcome back, Test').should('be.visible');
  });

  it('should show analytics overview cards with correct data', () => {
    // Check for the three main cards
    cy.get('.bg-\\[#EEEAF2\\]').should('have.length', 3);
    
    // Verify sessions card
    cy.contains('Total Sessions')
      .parents('.bg-\\[#EEEAF2\\]')
      .within(() => {
        cy.contains('42').should('be.visible');
      });

    // Verify clients card
    cy.contains('Total Clients')
      .parents('.bg-\\[#EEEAF2\\]')
      .within(() => {
        cy.contains('15').should('be.visible');
      });

    // Verify staff card
    cy.contains('Total Staff')
      .parents('.bg-\\[#EEEAF2\\]')
      .within(() => {
        cy.contains('5').should('be.visible');
      });
  });

  it('should display upcoming sessions', () => {
    cy.contains('h2', 'Upcoming Sessions').should('be.visible');
    cy.contains('Piano Lesson').should('be.visible');
    cy.contains('John Doe').should('be.visible');
  });

  it('should show recent clients table', () => {
    cy.contains('Recent Clients').should('be.visible');
    cy.contains('John Doe').should('be.visible');
    cy.contains('john@example.com').should('be.visible');
  });

  it('should allow changing the date range', () => {
    // Open the date range selector
    cy.get('.mantine-Select-input').click();
    
    // Select 'Last 7 Days' option
    cy.contains('Last 7 Days').click();
    
    // Verify the API was called with the new date range
    cy.wait('@getAnalytics').then((interception) => {
      expect(interception.request.url).to.include('range=last_7_days');
    });
  });

  it('should show loading states while fetching data', () => {
    // Test loading states by forcing a slow response
    cy.intercept('GET', '/api/analytics*', {
      delay: 2000,
      statusCode: 200,
      body: mockAnalytics
    }).as('slowAnalytics');

    cy.visit('/dashboard');
    
    // Verify loading states
    cy.get('.animate-pulse').should('exist');
    
    // Wait for data to load
    cy.wait('@slowAnalytics');
    
    // Loading states should be gone
    cy.get('.animate-pulse').should('not.exist');
  });
});
