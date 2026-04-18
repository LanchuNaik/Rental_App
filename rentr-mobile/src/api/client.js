import axios from 'axios';
import { getToken } from './storage';

// Change this one line when deploying to production
const BASE_URL = 'http://localhost:5001/api';

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,              // 10 seconds — fail if server takes too long
  headers: {
    'Content-Type': 'application/json',
  },
});

// REQUEST INTERCEPTOR
// Runs before every request — automatically attaches the token if one exists
apiClient.interceptors.request.use(
  async (config) => {
    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// RESPONSE INTERCEPTOR
// Runs after every response — extracts the error message cleanly
apiClient.interceptors.response.use(
  (response) => response.data,   // unwrap so callers get data directly, not response.data
  (error) => {
    // error.response exists when server replied (4xx, 5xx)
    const message =
      error.response?.data?.message ||
      error.response?.data?.error  ||
      error.message                ||
      'Something went wrong';
    return Promise.reject(new Error(message));
  }
);

export default apiClient;
