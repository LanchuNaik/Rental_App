import apiClient from '../api/client';

export const getItemsApi = (params) =>
  apiClient.get('/items', { params });

export const getItemByIdApi = (id) =>
  apiClient.get(`/items/${id}`);

export const getMyItemsApi = () =>
  apiClient.get('/items/my');

export const getNearbyItemsApi = (lat, lng, radius = 10) =>
  apiClient.get('/items/nearby', { params: { lat, lng, radius } });

export const getSavedItemsApi = () =>
  apiClient.get('/items/saved');

export const getAvailabilityApi = (itemId) =>
  apiClient.get(`/items/${itemId}/availability`);

export const saveItemApi = (itemId) =>
  apiClient.post(`/items/${itemId}/save`);

export const unsaveItemApi = (itemId) =>
  apiClient.delete(`/items/${itemId}/save`);

export const createItemApi = (formData) =>
  apiClient.post('/items', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const updateItemApi = (id, data) =>
  apiClient.put(`/items/${id}`, data);

export const deleteItemApi = (id) =>
  apiClient.delete(`/items/${id}`);
