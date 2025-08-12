describe('App Smoke Test', () => {
  beforeEach(() => {
    // Increase timeout for all commands in this test
    Cypress.config('defaultCommandTimeout', 120000);
    cy.log('Starting test with increased timeout');
  });

  it('should load the application', () => {
    // Log initial test state
    cy.log('Starting test at: ' + new Date().toISOString());

    // First, verify the server is accessible
    cy.request({
      url: 'http://localhost:5173',
      failOnStatusCode: false,
      timeout: 30000,
    }).then((response) => {
      cy.log(`Server response status: ${response.status}`);
      if (response.status === 0) {
        throw new Error(
          'Server is not accessible. Make sure the development server is running with `yarn dev`'
        );
      }
    });

    // Log before visit
    cy.log(
      'Attempting to visit the application at: ' + new Date().toISOString()
    );

    // Visit the application with detailed logging
    const testStartTime = new Date().toISOString();
    cy.log('Attempting to visit application at: ' + testStartTime);

    // Visit the application
    cy.visit('http://localhost:5173/', {
      timeout: 30000,
      failOnStatusCode: true,
      onBeforeLoad(win) {
        // Use console.log instead of cy.log in callbacks
        console.log('onBeforeLoad triggered at: ' + new Date().toISOString());
        // Disable service workers
        const nav = win.navigator as any;
        if (nav.__proto__ && nav.__proto__.serviceWorker) {
          delete nav.__proto__.serviceWorker;
        }
      },
      onLoad(win) {
        cy.log('onLoad event fired at: ' + new Date().toISOString());
      },
    });

    // Wait for the application to be interactive
    cy.window()
      .should('have.property', 'appReady', true)
      .then(() => {
        cy.log('Application is ready');
      });

    // Basic check that the page loaded
    cy.get('body', { timeout: 30000 })
      .should('exist')
      .and('be.visible')
      .then(($body) => {
        // Log some debug info
        cy.log('Body element found, checking for common elements');

        // Try to find any visible element that indicates the app loaded
        const appElement = $body.find('[data-cy="app"]').length
          ? '[data-cy="app"]'
          : 'body';
        cy.get(appElement, { timeout: 30000 })
          .should('be.visible')
          .screenshot('app-loaded');
      });
  });
});
