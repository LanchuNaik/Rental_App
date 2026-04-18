import apiClient from '../api/client';

export const loginApi = (email, password) =>
  apiClient.post('/auth/login', { email, password });

export const registerApi = (name, email, password) =>
  apiClient.post('/auth/signup', { name, email, password });

export const forgotPasswordApi = (email) =>
  apiClient.post('/auth/forgot-password', { email });

export const resetPasswordApi = (token, newPassword) =>
  apiClient.post('/auth/reset-password', { token, newPassword });
