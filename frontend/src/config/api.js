// API configuration for the application
// In development, we use Vite proxy, so API calls should be relative
// In production, this should be set to the actual backend URL

const API_BASE_URL = import.meta.env.PROD 
  ? (import.meta.env.VITE_API_BASE || 'https://your-production-backend.com')
  : '';

export default API_BASE_URL;