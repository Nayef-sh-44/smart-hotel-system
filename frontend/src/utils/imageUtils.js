import { API_BASE_URL } from '../services/api.js';

export function getImageUrl(imagePath) {
  if (!imagePath) return '';
  if (imagePath.startsWith('http')) return imagePath;
  
  // If it's an old seeded image, it's served statically by the frontend's public folder
  if (imagePath.startsWith('/images')) {
    return imagePath;
  }

  // If it's a newly uploaded image, it's served by the backend's /uploads route
  // API_BASE_URL is usually http://localhost:5000/api
  const baseUrl = API_BASE_URL.replace('/api', '');
  return `${baseUrl}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
}
