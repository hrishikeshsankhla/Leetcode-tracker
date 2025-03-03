import api from './api';

// Function to fetch CSRF token from the backend
export const fetchCsrfToken = async () => {
  try {
    const response = await api.get('/csrf-token/');
    return response.data;
  } catch (error) {
    console.error('Error fetching CSRF token:', error);
    return null;
  }
};

// Initialize CSRF protection when the app starts
export const initializeCsrf = () => {
  fetchCsrfToken()
    .then(() => console.log('CSRF protection initialized'))
    .catch(error => console.error('Failed to initialize CSRF protection:', error));
};
