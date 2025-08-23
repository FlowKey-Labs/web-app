/// <reference types="cypress" />

Cypress.on('uncaught:exception', (err) => {
  if (err.message.includes('removeChild')) {
    console.log('Ignoring removeChild error from React');
    return false;
  }
  return true;
});

const getISODateString = () => {
  const date = new Date();
  return date.toISOString();
};

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
    const fixedDate = '2025-01-01';
    
    cy.intercept('GET', '/api/policy/policies/', {
      statusCode: 200,
      body: [
        {
          id: 1,
          title: 'Sample Policy',
          content: '<p>Sample policy content</p>',
          policy_type: 'TEXT',
          file: null,
          last_modified: fixedDate,
          modified_by: null,
          sessions_count: 0,
          file_url: null
        },
      ],
    }).as('getPolicies');

    cy.intercept('POST', '/api/policy/policies/').as('createPolicy');

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
    cy.visit('/settings');

    cy.get('body').should('be.visible');

  });

  it('should create a new text policy', () => {
    const mockDate = new Date().toISOString();
    const newPolicy = {
      ...testPolicy,
      id: 1,
      created_at: mockDate,
      updated_at: mockDate,
    };

    cy.intercept('POST', '/api/policy/policies/', (req) => {
      const contentType = Array.isArray(req.headers['content-type'])
        ? req.headers['content-type'][0]
        : req.headers['content-type'] || '';
      const boundary = contentType.split('boundary=')[1];
      const formData = new FormData();

      const parts = req.body.split(`--${boundary}`);
      parts.forEach((part) => {
        if (part.includes('Content-Disposition: form-data;')) {
          const match = part.match(
            /name="([^"]+)"[\s\S]*?\r\n\r\n([\s\S]*?)\r\n/
          );
          if (match && match[1] && match[2]) {
            formData.set(match[1], match[2].trim());
          }
        }
      });

      const formDataObj: Record<string, string> = {};

      const title = formData.get('title');
      const content = formData.get('content');
      const policyType = formData.get('policy_type');

      if (title) formDataObj.title = title.toString();
      if (content) formDataObj.content = content.toString();
      if (policyType) formDataObj.policy_type = policyType.toString();

      expect(formDataObj).to.deep.include({
        title: testPolicy.title,
        policy_type: 'TEXT',
      });

      expect(formDataObj.content).to.exist;
      expect(formDataObj.content).to.include('Test policy content');

      req.reply({
        statusCode: 201,
        body: newPolicy,
      });
    }).as('createPolicy');

    cy.wait('@getPolicies');

    cy.get('[data-cy="policies-tab"]').should('be.visible').click();

    cy.get('[data-cy="policy-drawer"]', { timeout: 10000 })
      .should('be.visible')
      .within(() => {
        cy.get('[data-cy="policy-title-input"]')
          .clear()
          .type(testPolicy.title)
          .should('have.value', testPolicy.title);

        cy.get('[data-cy="policy-content-editor"]')
          .find('.ProseMirror')
          .should('be.visible')
          .type('Test policy content');

        cy.get('[data-cy="policy-submit-button"]').should('be.enabled').click();
      });

    cy.wait('@createPolicy');

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
      last_modified: '2025-01-01',
      modified_by: null,
      sessions_count: 0,
      file_url: null,
      file: null
    };

    cy.intercept('GET', '/api/policy/policies/', {
      statusCode: 200,
      body: [existingPolicy],
    }).as('getPolicies');

    const updatedPolicy = {
      ...existingPolicy,
      title: updatedTitle,
      last_modified: '2025-01-02',
    };

    cy.intercept('PATCH', `/api/policy/policies/${existingPolicy.id}/`, (req) => {
      console.log('Intercepted updatePolicy request:', {
        method: req.method,
        url: req.url,
        headers: req.headers,
        body: req.body,
      });

      expect(req.body).to.include(`name="title"`);
      expect(req.body).to.include(`name="policy_type"`);
      expect(req.body).to.include(`name="content"`);

      req.reply({
        statusCode: 200,
        body: updatedPolicy,
      });
    }).as('updatePolicy');

    cy.wait('@getPolicies');

    cy.get('[data-cy="policy-actions-dropdown"]').first().click();
    cy.get('[data-cy="edit-policy-button"]').click();

    cy.get('[data-cy="policy-drawer"]', { timeout: 10000 })
      .should('be.visible')
      .within(() => {
        cy.get('input[name="policyTitle"]')
          .should('be.visible')
          .should('have.value', existingPolicy.title);
        
        cy.get('input[name="policyTitle"]')
          .clear()
          .type(updatedTitle);
        
        cy.get('[data-cy="policy-content-editor"]')
          .find('.ProseMirror')
          .should('be.visible')
          .clear()
          .type('Updated policy content');
        
        cy.get('[data-cy="policy-submit-button"]')
          .should('be.enabled')
          .click();
      });

    cy.wait('@updatePolicy');
    cy.contains('Policy updated successfully!').should('be.visible');
    
  });
});
