import AsyncStorage from '@react-native-async-storage/async-storage';

// Save token + user after login
export const saveSession = async (token, user) => {
  await AsyncStorage.setItem('token', token);
  await AsyncStorage.setItem('user', JSON.stringify(user));
};

// Read token
export const getToken = () => AsyncStorage.getItem('token');

// Read user
export const getUser = async () => {
  const raw = await AsyncStorage.getItem('user');
  return raw ? JSON.parse(raw) : null;
};

// Clear everything on logout
export const clearSession = () => AsyncStorage.multiRemove(['token', 'user']);
