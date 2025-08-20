/// <reference types="cypress" />

Cypress.on('uncaught:exception', (err) => {
  if (err.message.includes('removeChild')) {
    console.log('Ignoring removeChild error from React');
    return false;
  }
  return true;
});

describe('Session Class Management', () => {
  const testSession = {
    classType: 'Regular',
    title: 'Test Yoga Class',
    description: 'Test session description',
    category: 'Yoga',
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    startTime: '09:30',
    endTime: '10:00',
    spots: '10',
    repetition: 'Daily',
    clientIds: 'Test Client',
    policyIds: 'Test Policy',
    staffIds: 'Test Staff',
    locationIds: 'Test Location',
  };

  beforeEach(() => {
    cy.intercept('GET', '/api/session/categories/', {
      statusCode: 200,
      body: [{ id: 1, name: 'Yoga' }],
    });

    cy.intercept('GET', '/api/staff/', {
      statusCode: 200,
      body: [{ id: 1, first_name: 'John', last_name: 'Doe' }],
    });

    cy.intercept('GET', '/api/locations/', {
      statusCode: 200,
      body: [{ id: 1, name: 'Main Studio' }],
    });

    cy.intercept('POST', '/api/session/', {
      statusCode: 201,
      body: { id: 123, ...testSession },
    }).as('createSession');

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

    cy.visit('/sessions');

    cy.get('body').should('be.visible');
  });

  it('should create a new session class', () => {
    cy.get('[data-cy="add-session-button"]').click();

    cy.contains('button', 'Class').click();

    cy.get('[data-cy="class-type-select"]').click();
    cy.get('div[class*="menu"]').should('be.visible');
    cy.contains('div[class*="option"]', testSession.classType).click({
      force: true,
    });

    cy.get('[data-cy="session-title"]').type(testSession.title);

    cy.get('[data-cy="session-description"]').type(testSession.description);

    cy.get('[data-cy="session-category-select"]').click();
    cy.get('div[class*="menu"]').should('be.visible');
    cy.contains('div[class*="option"]', testSession.category).click({
      force: true,
    });

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const formattedDate = tomorrow.toISOString().split('T')[0];
    cy.get('[data-cy="session-date"]').type(formattedDate);

    cy.get('input[type="time"]')
      .first()
      .invoke('val', testSession.startTime)
      .trigger('input')
      .trigger('change');

    cy.get('input[type="time"]')
      .last()
      .invoke('val', testSession.endTime)
      .trigger('input')
      .trigger('change');

    cy.get('[data-cy="repetition"]').click();
    cy.get('div[class*="menu"]').should('be.visible');
    cy.get('div[class*="option"]').contains(testSession.repetition).click({
      force: true,
    });

    cy.get('[data-cy="event-spots"]').type(testSession.spots);

    cy.get('[data-cy="clients-select"]').click();

    cy.get('div[class*="menu"]', { timeout: 10000 })
      .should('be.visible')
      .as('clientMenu')
      .then(($menu) => {
        cy.wait(500);

        const options = $menu.find('div[class*="option"]');
        const optionTexts = options.map((i, el) => el.innerText.trim()).get();
        cy.log('Available client options:', optionTexts);

        if (options.length > 1) {
          cy.wrap(options.eq(1))
            .should('be.visible')
            .click({ force: true, timeout: 5000 });
        } else {
          cy.get('@clientMenu')
            .find('input[type="text"]')
            .should('be.visible')
            .type(testSession.clientIds, {
              force: true,
              delay: 100,
            });

          cy.get('div[class*="option"]', { timeout: 5000 })
            .first()
            .should('be.visible')
            .click({ force: true });
        }
      });

    cy.wait(300);

    cy.get('[data-cy="policy-selector"]').within(() => {
      cy.get('.react-select__control').click({ force: true });

      cy.get('.react-select__menu', { timeout: 10000 })
        .should('be.visible')
        .as('policyMenu')
        .find('.react-select__option')
        .should('exist')
        .then(($options) => {
          const optionTexts = $options
            .map((i, el) => el.innerText.trim())
            .get();
          cy.log('Available policy options:', optionTexts);

          if ($options.length > 1) {
            cy.wrap($options.eq(1))
              .should('be.visible')
              .click({ force: true, timeout: 5000 });
          } else {
            cy.log('Error: No policy options available to select');
            throw new Error('No policy options available to select');
          }
        });
    });

    // Add a small delay before form submission
    cy.wait(500);

    cy.get('[data-cy="submit-session"]').click();

    cy.wait('@createSession').then((interception) => {
      const requestBody = interception.request.body;

      interface ExpectedBody {
        title: string;
        session_type: string;
        spots: number;
        date: string;
        start_time?: string | null;
        end_time?: string | null;
        repetition?: string;
      }

      const expectedBody: ExpectedBody = {
        title: testSession.title,
        session_type: 'class',
        spots: parseInt(testSession.spots),
        date: testSession.date,
      };

      if (requestBody.start_time !== null) {
        expectedBody.start_time = testSession.startTime;
      }
      if (requestBody.end_time !== null) {
        expectedBody.end_time = testSession.endTime;
      }

      if (requestBody.repetition !== undefined) {
        expectedBody.repetition = testSession.repetition.toUpperCase();
      }

      expect(requestBody).to.include(expectedBody);

      if (Array.isArray(requestBody.location_ids)) {
        expect(requestBody.location_ids.length).to.be.greaterThan(0);
      }
      if (Array.isArray(requestBody.client_ids)) {
        expect(requestBody.client_ids.length).to.be.greaterThan(0);
      }
      if (Array.isArray(requestBody.policy_ids)) {
        expect(requestBody.policy_ids.length).to.be.greaterThan(0);
      }
      if (Array.isArray(requestBody.staff_ids)) {
        expect(requestBody.staff_ids.length).to.be.greaterThan(0);
      }
    });
  });
});
