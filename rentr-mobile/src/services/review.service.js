import apiClient from '../api/client';

export const createReviewApi = (bookingId, rating, comment) =>
  apiClient.post('/reviews', { bookingId, rating, comment });

export const getItemReviewsApi = (itemId) =>
  apiClient.get(`/reviews/item/${itemId}`);
