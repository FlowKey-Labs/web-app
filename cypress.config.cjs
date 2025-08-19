const { defineConfig } = require('cypress');
require('dotenv').config();

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      config.env = {
        ...config.env,
        testEmail: process.env.CYPRESS_TEST_EMAIL,
        testPassword: process.env.CYPRESS_TEST_PASSWORD,
      };
      return config;
    },
    baseUrl: 'http://localhost:5173',
    supportFile: 'cypress/support/e2e.ts',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    video: false,
    screenshotOnRunFailure: true,
    viewportWidth: 1280,
    viewportHeight: 720,
    defaultCommandTimeout: 15000, // Increase default command timeout
    pageLoadTimeout: 120000,      // Increase page load timeout to 2 minutes
    requestTimeout: 15000,        // Increase API request timeout
    responseTimeout: 30000,       // Increase API response timeout
    execTimeout: 60000,           // Increase exec timeout
    taskTimeout: 60000,           // Increase task timeout
    // API testing configuration
    env: {
      apiUrl: 'http://127.0.0.1:8000',
      // Add any other environment variables
    },
  },
  component: {
    devServer: {
      framework: 'react',
      bundler: 'vite',
    },
    supportFile: 'cypress/support/component.ts',
    specPattern: 'cypress/component/**/*.cy.{js,jsx,ts,tsx}',
  },
});
