import apiClient from '../api/client';

// Fetch full message history for a booking's chat (oldest → newest)
export const getMessagesApi = (bookingId) =>
  apiClient.get(`/chat/${bookingId}`);
