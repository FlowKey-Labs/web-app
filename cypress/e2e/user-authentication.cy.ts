describe('Login', () => {
  beforeEach(() => {
    cy.clearCookies()
    cy.clearLocalStorage()
    
    // Mock the profile endpoint that gets called after login
    cy.intercept('GET', '/api/auth/profile', {
      statusCode: 200,
      body: {
        id: 1,
        email: 'martokhago@gmail.com',
        name: 'Test User',
      }
    }).as('getProfile')
    
    cy.visit('/login')
    // Wait for the page to be interactive
    cy.get('body').should('be.visible')
  })

  it('should login successfully with valid credentials', () => {
    // Mock the login API response
    const mockToken = 'fake-jwt-token'
    const mockUser = {
      id: 1,
      email: 'martokhago@gmail.com',
      name: 'Test User'
    }
    
    // Intercept the login API call
    cy.intercept('POST', '/api/auth/login', (req) => {
      req.reply({
        statusCode: 200,
        body: {
          user: mockUser,
          token: mockToken,
        },
        headers: {
          'Authorization': `Bearer ${mockToken}`
        }
      })
    }).as('loginRequest')
    
    // Set up localStorage mock
    cy.window().then((win) => {
      win.localStorage.setItem('authToken', mockToken)
      console.log('Auth token set in localStorage:', mockToken)
    })

    // Debug: Check if the login form exists
    cy.get('form').should('exist').then(($form) => {
      console.log('Form HTML:', $form.html())
    })

    // Fill in the login form using robust data-cy selectors
    cy.get('[data-cy=email-input]').should('be.visible').type('martokhago@gmail.com')
    cy.get('[data-cy=password-input]').should('be.visible').type('Paypal0!')
    cy.get('[data-cy=login-submit]').should('be.enabled').click()

    // Wait for login request and verify it was made correctly
    cy.wait('@loginRequest').then((interception) => {
      expect(interception.request.body).to.deep.include({
        email: 'martokhago@gmail.com',
        password: 'Paypal0!',
      })
      // Verify the response was handled correctly
      expect(interception.response?.statusCode).to.eq(200)
    })
    // Wait for the profile request that happens after login
    cy.wait('@getProfile')

    // Wait for dashboard content to appear
    cy.get('[data-cy=dashboard-main]', { timeout: 50000 }).should('be.visible')

    // Verify authentication state by checking for the auth token in localStorage
    cy.window().its('localStorage.authToken').should('exist')
    // Verify we're no longer on the login page
    cy.url().should('not.include', '/login')

    // Wait for login request and verify it was made correctly
    cy.wait('@loginRequest').then((interception) => {
      expect(interception.request.body).to.deep.include({
        email: 'martokhago@gmail.com',
        password: 'Paypal0!',
      })
      
      // Verify the response was handled correctly
      expect(interception.response?.statusCode).to.eq(200)
    })
    
    // Wait for the profile request that happens after login
    cy.wait('@getProfile')
    
    // Verify we're redirected to the dashboard after successful login
    cy.url().should('include', '/dashboard')
    
    // Verify authentication state by checking for the auth token in localStorage
    cy.window().its('localStorage.authToken').should('exist')
    
    // Verify we're no longer on the login page
    cy.url().should('not.include', '/login')
  })
})