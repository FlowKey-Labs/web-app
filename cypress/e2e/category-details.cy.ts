import {
  mockCategories,
  mockSubcategories,
  mockSkills,
} from '../fixtures/categories';

/// <reference types="cypress" />

Cypress.on('uncaught:exception', (err) => {
  if (err.message.includes('removeChild')) {
    console.log('Ignoring removeChild error from React');
    return false;
  }
  return true;
});

describe('Category Details Management', () => {
  beforeEach(() => {
    cy.intercept('GET', '/api/session/categories/', {
      statusCode: 200,
      body: mockCategories,
    }).as('getCategories');

    cy.intercept('GET', '/api/session/subcategories/', {
      statusCode: 200,
      body: mockSubcategories,
    }).as('getSubcategories');

    cy.intercept('GET', '/api/session/subskills/', {
      statusCode: 200,
      body: mockSkills,
    }).as('getSkills');

    // Mock successful subcategory creation
    cy.intercept('POST', '/api/session/subcategories/', (req) => {
      const newSubcategory = {
        id: 1,
        ...req.body,
      };
      return req.reply({
        statusCode: 201,
        body: newSubcategory,
      });
    }).as('createSubcategory');

    // Mock successful skill creation
    cy.intercept('POST', '/api/session/subskills/', (req) => {
      const newSkill = {
        id: 1,
        ...req.body,
      };
      return req.reply({
        statusCode: 201,
        body: newSkill,
      });
    }).as('createSkill');

    // Mock successful subcategory deletion
    cy.intercept('DELETE', '/api/session/subcategories/*', {
      statusCode: 204,
    }).as('deleteSubcategory');

    // Mock successful skill deletion
    cy.intercept('DELETE', '/api/session/subskills/*', {
      statusCode: 204,
    }).as('deleteSkill');

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

    cy.visit('/profile');

    cy.get('button').contains('Session Categories').click();
    cy.get(`[data-cy="category-${mockCategories[0].id}"]`).click();

    cy.wait(['@getCategories', '@getSubcategories', '@getSkills']);
  });

  it('should display category details and subcategories', () => {
    cy.contains('h2', mockCategories[0].name).should('exist');

    mockSubcategories.forEach((subcategory) => {
      cy.contains(subcategory.name).should('exist');
    });
  });

  it('should add a new subcategory', () => {
    const newSubcategory = {
      name: 'New Subcategory',
      description: 'Test subcategory description',
      category: 1,
    };

    cy.get('button').contains('Add Subcategory').click();

    cy.get('input[name="name"]').type(newSubcategory.name);
    cy.get('textarea[name="description"]').type(newSubcategory.description);

    // Submit the form
    cy.get('button[type="submit"]').click();

    // Verify the API was called
    cy.wait('@createSubcategory').then((interception) => {
      expect(interception.request.body).to.deep.equal(newSubcategory);
    });

    // Verify success notification
    cy.contains('Subcategory created successfully').should('exist');
  });

  it('should add a new skill to a subcategory', () => {
    const subcategory = mockSubcategories[0];
    const newSkill = {
      name: 'New Skill',
      description: 'Test skill description',
      subcategory: subcategory.id,
    };

    // Click add skill button for the first subcategory
    cy.get(`[data-testid="add-skill-${subcategory.id}"]`).click();

    // Fill out the form
    cy.get('input[name="name"]').type(newSkill.name);
    cy.get('textarea[name="description"]').type(newSkill.description);

    // Submit the form
    cy.get('button[type="submit"]').click();

    // Verify the API was called
    cy.wait('@createSkill').then((interception) => {
      expect(interception.request.body).to.deep.equal(newSkill);
    });

    // Verify success notification
    cy.contains('Skill created successfully').should('exist');
  });

  it('should delete a subcategory', () => {
    const subcategoryToDelete = mockSubcategories[0];

    cy.get(
      `[data-testid="delete-subcategory-${subcategoryToDelete.id}"]`
    ).click();

    // Confirm deletion in the modal
    cy.get('.mantine-Modal-root').within(() => {
      cy.contains('Confirm Delete').should('exist');
      cy.contains('Yes, delete').click();
    });

    // Verify the API was called
    cy.wait('@deleteSubcategory').then((interception) => {
      expect(interception.request.url).to.include(
        `/api/session/subcategories/${subcategoryToDelete.id}`
      );
    });

    // Verify success notification
    cy.contains('Subcategory deleted successfully').should('exist');
  });

  it('should handle API errors', () => {
    // Mock error response for subcategory creation
    cy.intercept('POST', '**/api/session/subcategories/', {
      statusCode: 500,
      body: { error: 'Internal server error' },
    }).as('createSubcategoryError');

    // Try to add a new subcategory
    cy.get('button').contains('Add Subcategory').click();
    cy.get('input[name="name"]').type('Test Error');
    cy.get('button[type="submit"]').click();

    // Verify error handling
    cy.wait('@createSubcategoryError');
    cy.contains('Failed to create subcategory').should('exist');
  });
});
