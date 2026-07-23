const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

/**
 * Fetch API helper for calling the backend API
 * @param {string} endpoint - API endpoint starting with /
 * @param {Object} [options={}] - Fetch options
 * @returns {Promise<any>} Response data
 */
export async function fetchAPI(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;

  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  const config = {
    ...options,
    credentials: 'include',
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  const response = await fetch(url, config);
  const data = await response.json();

  if (!response.ok || data.success === false) {
    const errorMessage = data.error || data.message || `HTTP error! status: ${response.status}`;
    throw new Error(errorMessage);
  }

  return data;
}
