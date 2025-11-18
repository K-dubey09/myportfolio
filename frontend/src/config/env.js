// Centralized frontend environment configuration
// Usage: import { API_BASE, API_URL, FILES_BASE } from '../config/env'

export const API_BASE = (import.meta.env && import.meta.env.VITE_API_BASE) || 'http://localhost:5000';
export const API_URL = `${API_BASE}/api`;
export const FILES_BASE = `${API_URL}/files`;
