// API Configuration
// Get API base URL from environment variable
// In Vite, environment variables must be prefixed with VITE_
export const API_BASE_URL = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';

// Export base URL without /api suffix for cases where full path is specified
export const API_ROOT_URL = import.meta.env.VITE_API_BASE 
  ? import.meta.env.VITE_API_BASE.replace(/\/api$/, '')
  : 'http://localhost:5000';

export default API_BASE_URL;
