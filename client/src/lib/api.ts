const BASE_URL = '/api';

// Define the API routes in a structured way
export const API_ROUTES = {
  AUTH: {
    LOGIN: `${BASE_URL}/auth/login`,
    ME: `${BASE_URL}/auth/me`,
  },
  KOLAM: {
    KNOW_YOUR_KOLAM: `${BASE_URL}/know-your-kolam`,
    RENDER: `${BASE_URL}/create_kolam`,
    PREDICT: `${BASE_URL}/predict`,
    SEARCH: `${BASE_URL}/search`,
    RECREATE: `${BASE_URL}/recreate`, // Add this line
    KNOW_AND_CREATE: `${BASE_URL}/know-and-create-kolam`,
  }
} as const;

export const localKey = {
  token: `store-app-token`,
}