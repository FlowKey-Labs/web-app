/// <reference types="cypress" />

describe('Policy Management', () => {
  const testUser = {
    email: 'test@example.com',
    token: 'mock-jwt-token'
  };

  const mockPolicy = {
    id: 1,
    name: 'Test Policy',
    description: 'Test Description',
    created_at: new Date().toISOString()
  };

  // Mock user data
  const mockUser = {
    id: 1,
    email: testUser.email,
    is_authenticated: true,
    is_staff: true
  };

  beforeEach(() => {
    // Log network requests for debugging
    cy.intercept('*', (req) => {
      console.log('Request:', req.method, req.url);
      req.continue();
    });

    // Mock auth endpoints
    cy.intercept('GET', '/api/auth/profile/', {
      statusCode: 200,
      body: mockUser
    }).as('getProfile');

    // Mock settings - only if the app makes this call
    cy.intercept('GET', '/api/settings*', { 
      statusCode: 200, 
      body: { policies: [] } 
    }).as('getSettings');
    
    // Mock policy creation
    cy.intercept('POST', '/api/policies/', {
      statusCode: 201,
      body: { ...mockPolicy, id: Math.floor(Math.random() * 1000) }
    }).as('createPolicy');

    // Set auth state before visiting
    cy.window().then((win) => {
      win.localStorage.setItem('accessToken', testUser.token);
      win.localStorage.setItem('user', JSON.stringify(mockUser));
    });

    // Start test at root and navigate to settings
    cy.visit('/', { 
      failOnStatusCode: false,
      onBeforeLoad(win) {
        // Ensure auth state is set before any app code runs
        win.localStorage.setItem('accessToken', testUser.token);
        win.localStorage.setItem('user', JSON.stringify(mockUser));
      }
    });
    
    // Wait for auth to complete
    cy.wait('@getProfile', { timeout: 10000 }).then((interception) => {
      console.log('Auth profile loaded:', interception?.response?.body);
    });
    
    // Only wait for settings if we're on the settings page
    cy.url().then((url) => {
      if (url.includes('/settings')) {
        cy.wait('@getSettings', { timeout: 10000 }).then((interception) => {
          console.log('Settings loaded:', interception?.response?.body);
        });
      }
    });
  });

  it('should load the policies page', () => {
    // First ensure we're on the settings page
    cy.url().then((url) => {
      if (!url.includes('/settings')) {
        cy.visit('/settings', { failOnStatusCode: false });
      }
    });
    
    // Wait for the page to be interactive
    cy.get('body', { timeout: 10000 }).should('be.visible');
    
    // Debug: Log current page content
    cy.document().then((doc) => {
      console.log('Page title:', doc.title);
      console.log('Current URL:', doc.URL);
      console.log('Body content:', doc.body.innerText.substring(0, 500) + '...');
    });
    
    // Try to find and click the policies tab if it exists
    cy.get('body').then(($body) => {
      const policiesTab = $body.find('button:contains("Policies")');
      if (policiesTab.length > 0) {
        cy.wrap(policiesTab).click({ force: true });
        cy.log('Clicked on Policies tab');
      } else {
        cy.log('Policies tab not found, continuing with current page');
      }
    });
    
    // Verify we can see either the policies page or the create button
    cy.get('body').then(($body) => {
      const policiesHeading = $body.find('h1:contains("Policies")');
      const createButton = $body.find('[data-testid="create-policy-button"], button:contains("Create Policy")');
      
      if (policiesHeading.length > 0) {
        cy.log('Found Policies heading');
      } else if (createButton.length > 0) {
        cy.log('Found create policy button');
      } else {
        // Take a screenshot if we can't find expected elements
        cy.screenshot('policies-page-not-loaded');
        throw new Error('Could not find Policies heading or create button on the page');
      }
    });
  });

  it('should create a new policy', function() {
    // Ensure we're on the settings page first
    cy.url().then((url) => {
      if (!url.includes('/settings')) {
        cy.visit('/settings', { failOnStatusCode: false });
      }
    });

    // Navigate to policies tab if needed
    cy.get('body').then(($body) => {
      const policiesTab = $body.find('button:contains("Policies")');
      if (policiesTab.length > 0) {
        cy.wrap(policiesTab).click({ force: true });
      }
    });

    // Wait for the create button to be visible and click it
    cy.get('[data-testid="create-policy-button"], button:contains("Create Policy")', { timeout: 10000 })
      .should('be.visible')
      .click();
    
    // Fill in the form
    const policyName = `Test Policy ${Date.now()}`;
    cy.get('input[name="name"]', { timeout: 5000 })
      .should('be.visible')
      .type(policyName);
    
    // Submit the form
    cy.get('form').submit();
    
    // Verify the API was called correctly
    cy.wait('@createPolicy', { timeout: 10000 }).then((interception) => {
      expect(interception.request.body).to.include({ name: policyName });
    });
    
    // Verify success message
    cy.contains('Policy created successfully', { timeout: 10000 })
      .should('be.visible');
  });

  it('should show validation errors', function() {
    // Ensure we're on the settings page first
    cy.url().then((url) => {
      if (!url.includes('/settings')) {
        cy.visit('/settings', { failOnStatusCode: false });
      }
    });
    
    // Navigate to policies tab if needed
    cy.get('body').then(($body) => {
      const policiesTab = $body.find('button:contains("Policies")');
      if (policiesTab.length > 0) {
        cy.wrap(policiesTab).click({ force: true });
      }
    });
    
    // Open the form
    cy.get('[data-testid="create-policy-button"], button:contains("Create Policy")', { timeout: 10000 })
      .should('be.visible')
      .click();
    
    // Try to submit without filling required fields
    cy.get('form').submit();
    
    // Check for validation error - be more flexible with the error message
    cy.contains(/this field is required|name is required/i, { timeout: 10000 })
      .should('be.visible');
  });
});
