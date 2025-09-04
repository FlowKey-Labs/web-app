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

    cy.intercept('DELETE', '/api/session/subcategories/*', {
      statusCode: 204,
    }).as('deleteSubcategory');

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
  });

  it('should add a new subcategory', () => {
    const newSubcategory = {
      ...mockSubcategories[0],
      category: mockCategories[0].id,
    };

    cy.get('button').contains('Add Subcategory').click();

    cy.get('input[name="name"]').type(newSubcategory.name);
    cy.get('textarea[name="description"]').type(newSubcategory.description);

    cy.get('button[type="submit"]').click();

    cy.wait('@createSubcategory').then((interception) => {
      const { name, description, category } = newSubcategory;
      expect(interception.request.body).to.deep.include({
        name,
        description,
        category,
      });
    });

    cy.contains('Subcategory created successfully').should('exist');
  });

  it('should add a new skill to a subcategory', () => {
    const subcategory = mockSubcategories[0];
    const newSkill = {
      ...mockSkills[0],
      subcategory: subcategory.id,
    };

    cy.contains('tr', subcategory.name)
      .find('[data-cy="action-options"]')
      .click({ force: true });
    cy.get(`[data-cy="add-skill-${subcategory.id}"]`).click();

    cy.get('[data-cy="skill-name-0"]').type(newSkill.name);
    cy.get('[data-cy="skill-description-0"]').type(newSkill.description);

    cy.get('button[type="submit"]').click();

    cy.wait('@createSkill').then((interception) => {
      const { name, description, subcategory } = newSkill;
      expect(interception.request.body).to.deep.include({
        name,
        description,
        subcategory,
      });
    });
  });

  it('should delete a subcategory', () => {
    const subcategoryToDelete = mockSubcategories[0];

    cy.contains('tr', subcategoryToDelete.name)
      .find('[data-cy="action-options"]')
      .click({ force: true });

    cy.get(
      `[data-cy="delete-subcategory-${subcategoryToDelete.id}"]`
    ).click();

    cy.get('[data-cy="confirm-delete-subcategory"]').click();

    cy.wait('@deleteSubcategory').then((interception) => {
      expect(interception.request.url).to.include(
        `/api/session/subcategories/${subcategoryToDelete.id}`
      );
    });

    cy.contains('Subcategory deleted successfully').should('exist');
  });
});
