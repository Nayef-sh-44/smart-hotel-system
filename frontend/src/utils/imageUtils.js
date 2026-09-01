import { API_BASE_URL } from '../services/api.js';

export function getImageUrl(imagePath) {
  if (!imagePath) return '';
  if (imagePath.startsWith('http')) return imagePath;
  // API_BASE_URL is usually http://localhost:5000/api
  const baseUrl = API_BASE_URL.replace('/api', '');
  return `${baseUrl}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
}
