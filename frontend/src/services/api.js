import axios from 'axios';

// In development, the proxy in package.json will redirect API calls
// In production, use the environment variable
const API_URL = process.env.NODE_ENV === 'production' 
  ? process.env.REACT_APP_API_URL || 'http://localhost:8000/api'
  : '/api';

// Function to get CSRF token from cookies
function getCsrfToken() {
  const cookieValue = document.cookie
    .split('; ')
    .find(row => row.startsWith('csrftoken='))
    ?.split('=')[1];
  return cookieValue || '';
}

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // This is important for sending cookies with cross-origin requests
});

// Add a request interceptor to add the auth token and CSRF token to requests
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add CSRF token for non-GET requests
    if (config.method !== 'get') {
      const csrfToken = getCsrfToken();
      if (csrfToken) {
        config.headers['X-CSRFToken'] = csrfToken;
      }
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If the error is due to an expired token and we haven't tried to refresh yet
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        // Use relative URL for refresh token in development
        const refreshUrl = process.env.NODE_ENV === 'production'
          ? `${API_URL}/auth/token/refresh/`
          : '/api/auth/token/refresh/';
        
        const response = await axios.post(refreshUrl, {
          refresh: refreshToken,
        }, {
          withCredentials: true,
          headers: {
            'X-CSRFToken': getCsrfToken()
          }
        });
        
        const { access } = response.data;
        localStorage.setItem('token', access);
        
        // Retry the original request with the new token
        originalRequest.headers.Authorization = `Bearer ${access}`;
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh token has expired, redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;