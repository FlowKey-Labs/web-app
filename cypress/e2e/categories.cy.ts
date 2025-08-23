import { mockCategories } from '../fixtures/categories';

/// <reference types="cypress" />

Cypress.on('uncaught:exception', (err) => {
  if (err.message.includes('removeChild')) {
    console.log('Ignoring removeChild error from React');
    return false;
  }
  return true;
});

describe('Category Management', () => {
  beforeEach(() => {
    cy.intercept('GET', '/api/session/categories/', {
      statusCode: 200,
      body: mockCategories,
    }).as('getCategories');

    cy.intercept('POST', '/api/session/categories/', (req) => {
      const newCategory = {
        id: 1,
        ...req.body,
      };
      return req.reply({
        statusCode: 201,
        body: newCategory,
      });
    }).as('createCategory');

    cy.intercept('PATCH', '/api/session/categories/*', (req) => {
      return req.reply({
        statusCode: 200,
        body: { ...req.body, id: req.url.split('/').pop() },
      });
    }).as('updateCategory');

    cy.intercept('DELETE', '/api/session/categories/*', {
      statusCode: 204,
    }).as('deleteCategory');

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

    cy.wait('@getCategories');
  });

  it('should display existing categories', () => {
    mockCategories.forEach((category) => {
      cy.contains(category.name).should('exist');
      if (category.description) {
        cy.contains(category.description).should('exist');
      }
    });
  });

  it('should add a new category', () => {
    const newCategory = {
      name: 'New Test Category',
      description: 'This is a test category',
    };

    cy.get('button').contains('Add Category').click();

    cy.get('input[name="name"]').type(newCategory.name);
    cy.get('textarea[name="description"]').type(newCategory.description);

    cy.get('button[type="submit"]').click();

    cy.wait('@createCategory').then((interception) => {
      expect(interception.request.body).to.deep.equal(newCategory);
    });

    cy.contains('Category created successfully').should('exist');
  });

  it('should edit an existing category', () => {
    const updatedName = 'Updated Category Name';
    const updatedDescription = 'Updated description';
    const categoryToEdit = mockCategories[0];

    cy.get(`[data-cy="edit-category-${categoryToEdit.id}"]`).first().click();

    cy.get('input[name="name"]').clear().type(updatedName);
    cy.get('textarea[name="description"]').clear().type(updatedDescription);

    cy.get('button[type="submit"]').click();

    cy.wait('@updateCategory').then((interception) => {
      expect(interception.request.body).to.deep.equal({
        name: updatedName,
        description: updatedDescription,
      });
      expect(interception.request.url).to.include(
        `/api/session/categories/${categoryToEdit.id}`
      );
    });

    cy.contains('Category updated successfully').should('exist');
  });

  it('should delete a category', () => {
    const categoryToDelete = mockCategories[0];

    cy.get(`[data-cy="delete-category-${categoryToDelete.id}"]`)
      .first()
      .click();

    cy.get('.mantine-Modal-root').within(() => {
      cy.get('[data-cy="confirm-delete-category"]').should('exist');
      cy.get('[data-cy="confirm-delete-category"]').click();
    });

    cy.wait('@deleteCategory').then((interception) => {
      expect(interception.request.url).to.include(
        `/api/session/categories/${categoryToDelete.id}`
      );
    });

    cy.contains('Category deleted successfully').should('exist');
  });
});
