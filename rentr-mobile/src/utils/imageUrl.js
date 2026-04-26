// ============================================
// imageUrl helper
// ============================================
// Backend image fields used to be relative paths like "uploads/items/abc.jpg"
// stored on the server. After migrating to Cloudinary, they're now full URLs
// like "https://res.cloudinary.com/.../rentr/items/abc.jpg".
//
// This helper handles both cases so the UI doesn't have to care:
//   - Full URL → return as-is
//   - Relative path → prepend the backend base URL (legacy data only)

const BASE_URL = process.env.EXPO_PUBLIC_API_URL?.replace('/api', '');

export function imageUrl(path) {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${BASE_URL}/${path}`;
}
