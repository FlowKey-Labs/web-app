import { mockCategories } from '../fixtures/categories';

describe('Category Management', () => {
  beforeEach(() => {
    // Mock the API responses
    cy.intercept('GET', '**/api/session/categories/', {
      statusCode: 200,
      body: mockCategories,
    }).as('getCategories');

    // Mock successful category creation
    cy.intercept('POST', '**/api/session/categories/', (req) => {
      const newCategory = {
        id: Math.floor(Math.random() * 1000),
        ...req.body,
      };
      return req.reply({
        statusCode: 201,
        body: newCategory,
      });
    }).as('createCategory');

    // Mock successful category update
    cy.intercept('PATCH', '**/api/session/categories/*', (req) => {
      return req.reply({
        statusCode: 200,
        body: { ...req.body, id: req.url.split('/').pop() },
      });
    }).as('updateCategory');

    // Mock successful category deletion
    cy.intercept('DELETE', '**/api/session/categories/*', {
      statusCode: 204,
    }).as('deleteCategory');

    // Set up localStorage for mock authentication
    cy.window().then((win) => {
      win.localStorage.setItem('accessToken', 'mock-access-token');
      win.localStorage.setItem('user', JSON.stringify({
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
        is_staff: true,
      }));
    });

    // Visit the page
    cy.visit('/profile/categories');
    
    // Wait for the categories to load
    cy.wait('@getCategories');
  });

  it('should display existing categories', () => {
    // Check if categories are displayed
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

    // Click add button
    cy.get('button').contains('Add Category').click();

    // Fill out the form
    cy.get('input[name="name"]').type(newCategory.name);
    cy.get('textarea[name="description"]').type(newCategory.description);
    
    // Submit the form
    cy.get('button[type="submit"]').click();

    // Verify the API was called
    cy.wait('@createCategory').then((interception) => {
      expect(interception.request.body).to.deep.equal(newCategory);
    });

    // Verify success notification
    cy.contains('Category created successfully').should('exist');
  });

  it('should edit an existing category', () => {
    const updatedName = 'Updated Category Name';
    const updatedDescription = 'Updated description';
    const categoryToEdit = mockCategories[0];

    // Click edit button for the first category
    cy.get(`[data-testid="edit-category-${categoryToEdit.id}"]`).first().click();

    // Update the form
    cy.get('input[name="name"]').clear().type(updatedName);
    cy.get('textarea[name="description"]').clear().type(updatedDescription);
    
    // Submit the form
    cy.get('button[type="submit"]').click();

    // Verify the API was called
    cy.wait('@updateCategory').then((interception) => {
      expect(interception.request.body).to.deep.equal({
        name: updatedName,
        description: updatedDescription,
      });
      expect(interception.request.url).to.include(`/api/session/categories/${categoryToEdit.id}`);
    });

    // Verify success notification
    cy.contains('Category updated successfully').should('exist');
  });

  it('should delete a category', () => {
    const categoryToDelete = mockCategories[0];

    // Click delete button for the first category
    cy.get(`[data-testid="delete-category-${categoryToDelete.id}"]`).first().click();
    
    // Confirm deletion in the modal
    cy.get('.mantine-Modal-root').within(() => {
      cy.contains('Confirm Delete').should('exist');
      cy.contains('Yes, delete').click();
    });

    // Verify the API was called
    cy.wait('@deleteCategory').then((interception) => {
      expect(interception.request.url).to.include(`/api/session/categories/${categoryToDelete.id}`);
    });

    // Verify success notification
    cy.contains('Category deleted successfully').should('exist');
  });

  it('should handle API errors', () => {
    // Mock error response for category creation
    cy.intercept('POST', '**/api/session/categories/', {
      statusCode: 500,
      body: { error: 'Internal server error' },
    }).as('createCategoryError');

    // Try to add a new category
    cy.get('button').contains('Add Category').click();
    cy.get('input[name="name"]').type('Test Error');
    cy.get('button[type="submit"]').click();

    // Verify error handling
    cy.wait('@createCategoryError');
    cy.contains('Failed to create category').should('exist');
  });
});
