// Environment-based configuration
export const config = {
  // Determine environment
  isDevelopment: import.meta.env.MODE === 'development',
  isProduction: import.meta.env.MODE === 'production',
  
  // Base URLs based on environment
  getBaseUrl: () => {
    if (import.meta.env.MODE === 'development') {
      return 'http://localhost:5173';
    }
    return 'https://flowkeylabs.com';
  },
  
  // Get current app origin for preview links
  getCurrentOrigin: () => {
    if (typeof window !== 'undefined') {
      return window.location.origin;
    }
    // Fallback for SSR
    return config.getBaseUrl();
  },
  
  // API URLs
  getApiUrl: () => {
    if (import.meta.env.MODE === 'development') {
      return 'https://api-dev.flowkeylabs.com';
    }
    return 'https://api.flowkeylabs.com';
  },
  
  // Booking URLs
  getBookingUrl: (slug?: string) => {
    const baseUrl = config.getBaseUrl();
    if (!slug) {
      return `${baseUrl}/book/your-business-slug`;
    }
    return `${baseUrl}/book/${slug}`;
  },
  
  // Preview booking URL for admins (uses current app origin)
  getPreviewBookingUrl: (slug?: string) => {
    const currentOrigin = config.getCurrentOrigin();
    if (!slug) {
      return `${currentOrigin}/book/your-business-slug`;
    }
    return `${currentOrigin}/book/${slug}`;
  },
  
  // Email addresses
  emails: {
    support: 'info@flowkeylabs.com',
    noreply: 'noreply@flowkeylabs.com',
    dev: 'dev@flowkeylabs.com',
  },
  
  // App information
  app: {
    name: 'FlowKey',
    company: 'FlowKey Labs',
    supportEmail: 'info@flowkeylabs.com',
  }
};

export default config; 