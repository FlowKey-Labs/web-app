
import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    // Increase timeouts
    defaultCommandTimeout: 30000, 
    pageLoadTimeout: 120000, 
    requestTimeout: 10000, 
    responseTimeout: 30000, 
    chromeWebSecurity: false,
    video: true,
    screenshotOnRunFailure: true,
    videoCompression: 20, 
    experimentalMemoryManagement: true,
    experimentalRunAllSpecs: true,
    viewportWidth: 1280,
    viewportHeight: 800,
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    retries: {
      runMode: 1,
      openMode: 0
    }
  },
});
