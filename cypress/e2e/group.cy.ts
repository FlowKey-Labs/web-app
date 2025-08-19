describe('Group Creation', () => {
  const groupName = {
    name: `Test Group ${Date.now()}`,
    description: 'Test group description',
    location: 'Test Location', 
    memberName: 'Test Client', 
    contactPersonName: 'Test Contact' 
  };

  beforeEach(() => {
    cy.intercept('GET', '/api/business/locations/', {
      statusCode: 200,
      body: [
        { id: 1, name: 'Test Location' },
        { id: 2, name: 'Another Location' },
      ],
    }).as('getLocations');

    cy.intercept('GET', '/api/group/', {
      statusCode: 200,
      body: {
        id: 1,
        name: groupName.name,
        description: groupName.description,
        location: groupName.location,
        members: groupName.memberName,
        contactPerson: groupName.contactPersonName,
      },
    }).as('createGroup');

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
  });

  it('should create a new group', () => {
    cy.intercept('POST', '/api/group/').as('createGroup');

    cy.get('[data-cy="groups-tab"]').should('be.visible').click();
    cy.get('[data-cy="add-group-button"]').should('be.visible').click();
    
    cy.get('[data-cy="open-group-form"]').should('be.visible').click();
    

    cy.get('[data-cy="group-name-input"]').should('be.visible').type(groupName.name);
    cy.get('[data-cy="group-description-input"]').type(groupName.description);

    cy.get('[data-cy="group-location-select"]').click();
    cy.get('.react-select__menu').should('be.visible');
    cy.contains('.react-select__option', groupName.location).click();

    cy.get('[data-cy="group-members-select"]').click();
    cy.get('.react-select__menu').should('be.visible');
    
    let firstMemberName = '';
    cy.get('.react-select__option').first().then(($option) => {
      firstMemberName = $option.text().trim();
      cy.wrap($option).click();
    });
    
    cy.get('.react-select__option').eq(1).click();
    
    cy.get('body').click(0, 0);
        
    cy.get('[data-cy="contact-person-select"]').scrollIntoView().should('be.visible');
    
    cy.get('[data-cy="contact-person-select"]').click({ force: true });
    
    cy.get('.react-select__menu', { timeout: 10000 }).should('be.visible');
    
    cy.contains('.react-select__option', firstMemberName).should('be.visible').click({ force: true });

    cy.get('[data-cy="group-submit-button"]').should('be.visible').click();

    cy.wait('@createGroup').then((interception) => {
      expect(interception.response?.statusCode).to.eq(201);
      expect(interception.request.body).to.have.property(
        'name',
        groupName.name
      );
      expect(interception.request.body)
        .to.have.property('client_ids')
        .and.be.an('array').that.is.not.empty;
    });

    cy.contains('Group created successfully').should('be.visible');
  });
});
