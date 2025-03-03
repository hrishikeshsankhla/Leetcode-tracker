import api from './api';

// Define the auth URL prefix - baseURL already includes '/api'
const AUTH_URL = '/auth';

export const login = async (credentials) => {
  // Change from /token/ to /login/ as that's the standard dj-rest-auth endpoint
  const response = await api.post(`${AUTH_URL}/login/`, credentials);
  if (response.data.access) {
    localStorage.setItem('token', response.data.access);
    localStorage.setItem('refreshToken', response.data.refresh);
  }
  return response.data;
};

export const register = async (userData) => {
  return api.post(`${AUTH_URL}/registration/`, userData);
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
};

export const googleLogin = async (accessToken) => {
  const response = await api.post(`${AUTH_URL}/google/`, { access_token: accessToken });
  if (response.data.access) {
    localStorage.setItem('token', response.data.access);
    localStorage.setItem('refreshToken', response.data.refresh);
  }
  return response.data;
};

export const getCurrentUser = async () => {
  return api.get('/me/');
};

export const getUserProfile = async () => {
  return api.get('/me/profile/');
};

export const updateUserProfile = async (userData) => {
  return api.patch('/me/', userData);
};

export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};