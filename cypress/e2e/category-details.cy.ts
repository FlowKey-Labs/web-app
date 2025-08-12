import { mockCategories, mockSubcategories, mockSkills } from '../fixtures/categories';

describe('Category Details Management', () => {
  const category = mockCategories[0];
  const categorySubcategories = mockSubcategories.filter(
    (sub) => sub.category === category.id
  );

  beforeEach(() => {
    // Mock the API responses
    cy.intercept('GET', '**/api/session/categories/', {
      statusCode: 200,
      body: mockCategories,
    }).as('getCategories');

    cy.intercept('GET', '**/api/session/subcategories/', {
      statusCode: 200,
      body: mockSubcategories,
    }).as('getSubcategories');

    cy.intercept('GET', '**/api/session/subskills/', {
      statusCode: 200,
      body: mockSkills,
    }).as('getSkills');

    // Mock successful subcategory creation
    cy.intercept('POST', '**/api/session/subcategories/', (req) => {
      const newSubcategory = {
        id: Math.floor(Math.random() * 1000),
        ...req.body,
      };
      return req.reply({
        statusCode: 201,
        body: newSubcategory,
      });
    }).as('createSubcategory');

    // Mock successful skill creation
    cy.intercept('POST', '**/api/session/subskills/', (req) => {
      const newSkill = {
        id: Math.floor(Math.random() * 1000),
        ...req.body,
      };
      return req.reply({
        statusCode: 201,
        body: newSkill,
      });
    }).as('createSkill');

    // Mock successful subcategory deletion
    cy.intercept('DELETE', '**/api/session/subcategories/*', {
      statusCode: 204,
    }).as('deleteSubcategory');

    // Mock successful skill deletion
    cy.intercept('DELETE', '**/api/session/subskills/*', {
      statusCode: 204,
    }).as('deleteSkill');

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

    // Visit the category details page
    cy.visit(`/profile/categories/${category.id}`);
    
    // Wait for all API calls to complete
    cy.wait(['@getCategories', '@getSubcategories', '@getSkills']);
  });

  it('should display category details and subcategories', () => {
    // Verify category name is displayed
    cy.contains('h2', category.name).should('exist');
    
    // Verify subcategories are displayed
    categorySubcategories.forEach((subcategory) => {
      cy.contains(subcategory.name).should('exist');
    });
  });

  it('should add a new subcategory', () => {
    const newSubcategory = {
      name: 'New Subcategory',
      description: 'Test subcategory description',
      category: category.id,
    };

    // Click add subcategory button
    cy.get('button').contains('Add Subcategory').click();

    // Fill out the form
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
    const subcategory = categorySubcategories[0];
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
    const subcategoryToDelete = categorySubcategories[0];

    // Click delete button for the first subcategory
    cy.get(`[data-testid="delete-subcategory-${subcategoryToDelete.id}"]`).click();
    
    // Confirm deletion in the modal
    cy.get('.mantine-Modal-root').within(() => {
      cy.contains('Confirm Delete').should('exist');
      cy.contains('Yes, delete').click();
    });

    // Verify the API was called
    cy.wait('@deleteSubcategory').then((interception) => {
      expect(interception.request.url).to.include(`/api/session/subcategories/${subcategoryToDelete.id}`);
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
