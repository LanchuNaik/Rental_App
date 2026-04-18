import apiClient from '../api/client';

export const createBookingApi = (data) =>
  apiClient.post('/bookings', data);

export const getMyBookingsApi = () =>
  apiClient.get('/bookings/my');

export const getIncomingRequestsApi = () =>
  apiClient.get('/bookings/incoming');

export const getBookingByIdApi = (id) =>
  apiClient.get(`/bookings/${id}`);

export const acceptBookingApi = (id) =>
  apiClient.put(`/bookings/${id}/accept`);

export const rejectBookingApi = (id, reason) =>
  apiClient.put(`/bookings/${id}/reject`, { reason });

export const cancelBookingApi = (id) =>
  apiClient.put(`/bookings/${id}/cancel`);

export const uploadPickupPhotosApi = (id, photos) => {
  const formData = new FormData();
  photos.forEach((uri) => {
    formData.append('photos', {
      uri,
      name: `pickup_${Date.now()}.jpg`,
      type: 'image/jpeg',
    });
  });
  return apiClient.put(`/bookings/${id}/pickup`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const confirmReturnApi = (id, photos) => {
  const formData = new FormData();
  photos.forEach((uri) => {
    formData.append('photos', {
      uri,
      name: `return_${Date.now()}.jpg`,
      type: 'image/jpeg',
    });
  });
  return apiClient.put(`/bookings/${id}/return`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
