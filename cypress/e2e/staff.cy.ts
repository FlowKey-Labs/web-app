/// <reference types="cypress" />

describe('Staff Management', () => {
  const staffMember = {
    email: `test.staff${Date.now()}@example.com`,
    userId: `ID-${Math.floor(10000 + Math.random() * 90000)}`,
    role: 'Staff',
    roleId: '1',
    payType: 'hourly',
    payTypeLabel: 'Hourly',
    hourlyRate: '25.00',
  };

  // Mock roles data for testing
  const mockRoles = [
    { id: '1', name: 'Staff' },
    { id: '2', name: 'Manager' },
    { id: '3', name: 'Admin' },
  ];

  beforeEach(() => {
    cy.intercept('GET', '/api/auth/roles', {
      statusCode: 200,
      body: mockRoles,
    }).as('getRoles');

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

    cy.visit('/staff');

    cy.get('body').should('be.visible');
  });

  it('should navigate to staff creation page', () => {
    cy.get('button[data-cy="add-staff-button"]')
      .first()
      .should('be.visible')
      .and('not.be.disabled');

    cy.get('button[data-cy="add-staff-button"]').first().click({ force: true });

    cy.url({ timeout: 10000 }).should('include', '/staff');

    cy.get('[data-cy="staff-email-input"]', { timeout: 10000 }).should(
      'be.visible'
    );
  });

  it('should fill out the staff profile form', () => {
    cy.get('button[data-cy="add-staff-button"]')
      .first()
      .should('be.visible')
      .click({ force: true });

    cy.get('[data-cy="staff-email-input"]', { timeout: 10000 })
      .should('be.visible')
      .type(staffMember.email);

    cy.get('[data-cy="staff-id-input"]')
      .should('be.visible')
      .type(staffMember.userId);

    cy.get('[data-cy="continue-button"]')
      .should('be.visible')
      .and('not.be.disabled')
      .click({ force: true });

    cy.get('h3', { timeout: 10000 })
      .should('be.visible')
      .and('contain', 'Role');
  });

  it('should fill out the staff role form', () => {
    cy.get('button[data-cy="add-staff-button"]')
      .first()
      .should('be.visible')
      .click({ force: true });

    cy.get('[data-cy="staff-email-input"]', { timeout: 10000 })
      .should('be.visible')
      .type(staffMember.email);

    cy.get('[data-cy="staff-id-input"]')
      .should('be.visible')
      .type(staffMember.userId);

    cy.get('[data-cy="continue-button"]')
      .should('be.visible')
      .click({ force: true });

    cy.get('h3').should('contain', 'Role');

    cy.get('[data-cy="role-dropdown"] input')
      .should('be.visible', { timeout: 10000 })
      .first()
      .click({ force: true });

    cy.get('div[role="listbox"]', { timeout: 10000 })
      .should('be.visible')
      .find('div[role="option"]')
      .contains(staffMember.role, { timeout: 5000 })
      .should('be.visible')
      .click({ force: true });

    cy.get('[data-cy="pay-type-dropdown"]').should('be.visible').click();

    cy.get('div[role="listbox"]', { timeout: 10000 })
      .should('be.visible')
      .then(($listbox) => {
        cy.log(
          `Found listbox with ${
            $listbox.find('[role="option"]').length
          } options`
        );
      });

    cy.get('div[role="listbox"] [role="option"]')
      .contains(staffMember.payType, { matchCase: false })
      .should('be.visible')
      .click({ force: true });

    if (staffMember.payType === 'hourly') {
      cy.get('[data-cy="hourly-rate-input"]')
        .should('be.visible')
        .clear()
        .type(staffMember.hourlyRate);
    }

    cy.get('[data-cy="continue-button"]')
      .should('be.visible')
      .and('not.be.disabled')
      .click({ force: true });

    cy.get('h3', { timeout: 10000 })
      .should('be.visible')
      .and('contain', 'Review');
  });

  it('should submit the staff creation form', () => {
    cy.intercept('POST', '/api/staff/', {
      statusCode: 201,
      body: {
        id: 1,
        email: staffMember.email,
        role: staffMember.roleId,
        pay_type: staffMember.payType,
        rate: staffMember.hourlyRate,
        member_id: staffMember.userId,
        isActive: true,
      },
    }).as('createStaff');

    cy.get('button[data-cy="add-staff-button"]')
      .first()
      .should('be.visible')
      .click({ force: true });

    cy.get('[data-cy="staff-email-input"]', { timeout: 10000 })
      .should('be.visible')
      .type(staffMember.email);

    cy.get('[data-cy="staff-id-input"]')
      .should('be.visible')
      .type(staffMember.userId);

    cy.get('[data-cy="continue-button"]')
      .should('be.visible')
      .click({ force: true });

    cy.get('h3').should('contain', 'Role');

    cy.get('[data-cy="role-dropdown"]', { timeout: 10000 })
      .should('be.visible')
      .click({ force: true });

    cy.get('[data-cy="pay-type-dropdown"]')
      .should('be.visible')
      .click({ force: true });

    if (staffMember.payType === 'hourly') {
      cy.get('[data-cy="hourly-rate-input"]')
        .should('be.visible')
        .clear()
        .type(staffMember.hourlyRate);
    }

    cy.get('[data-cy="continue-button"]')
      .should('be.visible')
      .click({ force: true });

    cy.get('h3', { timeout: 15000 })
      .should('be.visible')
      .and('contain', 'Review');

    cy.wait(1000);

    cy.get('button').contains('Finish').should('be.visible').click();

    cy.url().should('include', '/staff');
  });
});
