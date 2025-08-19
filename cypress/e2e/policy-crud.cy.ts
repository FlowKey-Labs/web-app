/// <reference types="cypress" />

// Helper function to get a properly formatted date string
const getISODateString = () => {
  const date = new Date();
  return date.toISOString();
};

// Test data
const testPolicy = {
  id: 1,
  title: `Test Policy ${Date.now()}`,
  content: `<p>Test policy content ${Date.now()}</p>`,
  policy_type: 'TEXT' as const,
  file: null,
  created_at: getISODateString(),
  updated_at: getISODateString(),
};

describe('Policy Management', () => {
  beforeEach(() => {
    const email = Cypress.env('testEmail');
    const password = Cypress.env('testPassword');

    if (!email || !password) {
      throw new Error('Missing test credentials.');
    }

    // Login and navigate to settings
    cy.login(email, password);
    cy.visit('/settings');

    // Setup policy tests
    cy.setupPolicyTests();
  });

  it('should create a new text policy', () => {
    // Mock API responses
    cy.intercept('GET', '/api/policy/policies/', {
      statusCode: 200,
      body: [],
    }).as('getPolicies');

    // Mock the create policy response
    const newPolicy = {
      ...testPolicy,
      id: 1,
      created_at: getISODateString(),
      updated_at: getISODateString(),
    };

    // Intercept the form submission
    cy.intercept('POST', '/api/policy/policies/', (req) => {
      // Get content-type header and ensure it's a string
      const contentType = Array.isArray(req.headers['content-type']) 
        ? req.headers['content-type'][0] 
        : req.headers['content-type'] || '';
      const boundary = contentType.split('boundary=')[1];
      const formData = new FormData();
      
      // Parse the multipart form data
      const parts = req.body.split(`--${boundary}`);
      parts.forEach(part => {
        if (part.includes('Content-Disposition: form-data;')) {
          const match = part.match(/name="([^"]+)"[\s\S]*?\r\n\r\n([\s\S]*?)\r\n/);
          if (match && match[1] && match[2]) {
            formData.set(match[1], match[2].trim());
          }
        }
      });
      
      // Create an object to store form data
      const formDataObj: Record<string, string> = {};
      
      // Get each field value from form data
      const title = formData.get('title');
      const content = formData.get('content');
      const policyType = formData.get('policy_type');
      
      if (title) formDataObj.title = title.toString();
      if (content) formDataObj.content = content.toString();
      if (policyType) formDataObj.policy_type = policyType.toString();
      
      // Assert the form data
      expect(formDataObj).to.deep.include({
        title: testPolicy.title,
        policy_type: 'TEXT',
        content: testPolicy.content,
      });

      // Respond with the mock data
      req.reply({
        statusCode: 201,
        body: newPolicy,
      });
    }).as('createPolicy');

    // Wait for policies to load
    cy.wait('@getPolicies');

    // Verify the policy drawer is open and fill the form
    cy.get('[data-cy="policy-drawer"]', { timeout: 10000 })
      .should('be.visible')
      .within(() => {
        // Fill in the title
        cy.get('[data-cy="policy-title-input"]')
          .clear()
          .type(testPolicy.title)
          .should('have.value', testPolicy.title);

        // Type in the rich text editor
        cy.get('[data-cy="policy-content-editor"]')
          .find('.ProseMirror')
          .should('be.visible')
          .type('Test policy content');

        // Submit the form
        cy.get('[data-cy="policy-submit-button"]').should('be.enabled').click();
      });

    // Wait for the API call to complete
    cy.wait('@createPolicy');

    // Verify success message and drawer is closed
    cy.contains('Policy created successfully!').should('be.visible');
    cy.get('[data-cy="policy-drawer"]').should('not.exist');
  });

  it('should edit an existing policy', () => {
    const updatedTitle = `Updated Policy ${Date.now()}`;
    const existingPolicy = {
      id: 1,
      title: 'Existing Policy',
      content: '<p>Existing content</p>',
      policy_type: 'TEXT' as const,
      created_at: getISODateString(),
      updated_at: getISODateString(),
    };

    // Mock GET with the existing policy
    cy.intercept('GET', '/api/policy/policies/', {
      statusCode: 200,
      body: [existingPolicy],
    }).as('getPolicies');

    // Mock the update endpoint with form data handling
    const updatedPolicy = {
      ...existingPolicy,
      title: updatedTitle,
      updated_at: getISODateString(),
    };

    // Intercept the update request
    cy.intercept('PUT', `/api/policy/policies/${existingPolicy.id}`, (req) => {
      // Get content-type header and ensure it's a string
      const contentType = Array.isArray(req.headers['content-type']) 
        ? req.headers['content-type'][0] 
        : req.headers['content-type'] || '';
      const boundary = contentType.split('boundary=')[1];
      const formData = new FormData();
      
      // Parse the multipart form data
      const parts = req.body.split(`--${boundary}`);
      parts.forEach(part => {
        if (part.includes('Content-Disposition: form-data;')) {
          const match = part.match(/name="([^"]+)"[\s\S]*?\r\n\r\n([\s\S]*?)\r\n/);
          if (match && match[1] && match[2]) {
            formData.set(match[1], match[2].trim());
          }
        }
      });
      
      // Create an object to store form data
      const formDataObj: Record<string, string> = {};
      
      // Get each field value from form data
      const title = formData.get('title');
      const content = formData.get('content');
      const policyType = formData.get('policy_type');
      
      if (title) formDataObj.title = title.toString();
      if (content) formDataObj.content = content.toString();
      if (policyType) formDataObj.policy_type = policyType.toString();
      
      // Assert the form data
      expect(formDataObj).to.deep.include({
        title: updatedTitle,
        content: existingPolicy.content,
        policy_type: 'TEXT',
      });

      // Respond with the mock data
      req.reply({
        statusCode: 200,
        body: updatedPolicy,
      });
    }).as('updatePolicy');

    // Wait for policies to load
    cy.wait('@getPolicies');

    // Find and click the edit button for the policy
    cy.contains('tr', existingPolicy.title)
      .find('[data-cy="edit-policy-button"]')
      .should('be.visible')
      .click();

    // Verify the form is pre-filled with existing data
    cy.get('[data-cy="policy-drawer"]', { timeout: 10000 })
      .should('be.visible')
      .within(() => {
        // Verify and update the title
        cy.get('[data-cy="policy-title-input"]')
          .should('have.value', existingPolicy.title)
          .clear()
          .type(updatedTitle);

        // Submit the form
        cy.get('[data-cy="policy-submit-button"]').should('be.enabled').click();
      });

    // Wait for the API call to complete
    cy.wait('@updatePolicy');

    // Verify success message and drawer is closed
    cy.contains('Policy updated successfully!').should('be.visible');
    cy.get('[data-cy="policy-drawer"]').should('not.exist');
  });
});
