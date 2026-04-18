import apiClient from '../api/client';

export const getProfileApi = () =>
  apiClient.get('/profile');

export const updateProfileApi = (data) =>
  apiClient.put('/profile', data);

export const updateAvatarApi = (imageUri) => {
  // Avatar upload needs FormData — not JSON
  const formData = new FormData();
  formData.append('avatar', {
    uri: imageUri,
    name: 'avatar.jpg',
    type: 'image/jpeg',
  });
  return apiClient.put('/profile/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const getPublicProfileApi = (userId) =>
  apiClient.get(`/users/${userId}`);
