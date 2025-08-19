/// <reference types="cypress" />

describe('Client Management', () => {
  const client = {
    firstName: `Test${Date.now()}`,
    lastName: `Client${Date.now()}`,
    email: `test.client${Date.now()}@example.com`,
    phone: `+254${Math.floor(2000000000 + Math.random() * 9000000000)}`,
    location: '1', // Location ID
    locationName: 'Test Location', // For UI selection
    gender: 'M', // 'M' or 'F' as expected by the API
    dob: '1990-01-01' // Adding date of birth
  };

  beforeEach(() => {
    // Mock locations data
    cy.intercept('GET', '/api/business/locations/', {
      statusCode: 200,
      body: [
        { id: 1, name: 'Test Location' },
        { id: 2, name: 'Another Location' },
      ],
    }).as('getLocations');

    // Mock successful client creation
    cy.intercept('POST', '/api/client/', {
      statusCode: 201,
      body: {
        id: 1,
        first_name: client.firstName,
        last_name: client.lastName,
        email: client.email,
        phone_number: client.phone,
        location: client.location,
        gender: client.gender,
        dob: client.dob,
      },
    }).as('createClient');

    // Login before each test
    const email = Cypress.env('testEmail');
    const password = Cypress.env('testPassword');

    if (!email || !password) {
      throw new Error(
        'Missing test credentials. Please set CYPRESS_TEST_EMAIL and CYPRESS_TEST_PASSWORD environment variables.'
      );
    }

    cy.session([email, password], () => {
      cy.visit('/login');

      cy.get('input[type="email"]', { timeout: 10000 })
        .should('be.visible')
        .type(email);

      cy.get('input[type="password"]')
        .should('be.visible')
        .type(password, { log: false });

      cy.get('button[type="submit"]').should('be.visible').click();

      cy.url({ timeout: 30000 })
        .should('include', '/dashboard')
        .then(() => {
          cy.get('body').should('be.visible');
        });
    });

    cy.visit('/clients');
    cy.get('body').should('be.visible');
  });

  it('should navigate to client creation page', () => {
    // Click the add client button
    cy.get('button[data-cy="add-client-button"]')
      .first()
      .should('be.visible')
      .click({ force: true });

    // Verify we're on the client creation page
    cy.url().should('include', '/clients');
  });

  it('should fill out and submit the client creation form', () => {
    // Navigate to client creation
    cy.get('button[data-cy="add-client-button"]').first().click({ force: true });
    
    // Wait for the form to be visible
    cy.get('form', { timeout: 10000 }).should('be.visible');

    // Fill out the form
    cy.get('[data-cy="first-name-input"]')
      .should('be.visible')
      .type(client.firstName);

    cy.get('[data-cy="last-name-input"]')
      .should('be.visible')
      .type(client.lastName);
      
    cy.get('[data-cy="phone-input"]')
      .should('be.visible')
      .type(client.phone);
      
    cy.get('[data-cy="email-input"]')
      .should('be.visible')
      .type(client.email);


    // Fill date of birth
    cy.get('input[type="date"]').type(client.dob);

    // Select location from dropdown
    cy.get('[data-cy="location-select"]').click();
    cy.get('.react-select__menu').should('be.visible');
    cy.contains('.react-select__option', client.locationName).click();

    // Select gender
    cy.get('[data-cy="gender-select"]').click();
    cy.get('.react-select__menu').should('be.visible');
    cy.contains('.react-select__option', client.gender === 'M' ? 'Male' : 'Female').click();

    // Submit the form
    cy.get('button[type="submit"]')
      .should('be.visible')
      .and('not.be.disabled')
      .click();

    // Verify the API call was made with the correct data
    cy.wait('@createClient').then((interception) => {
      expect(interception.request.body).to.deep.include({
        first_name: client.firstName,
        last_name: client.lastName,
        email: client.email,
        phone_number: client.phone,
        location: client.location, // This should be the location ID
        gender: client.gender,
        dob: client.dob,
      });
    });

    // Verify success notification
    cy.get('.mantine-Notification-title').should('contain', 'Success');

    // Verify redirection to clients list
    cy.url().should('include', '/clients');
  });

});