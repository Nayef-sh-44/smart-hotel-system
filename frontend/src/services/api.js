import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT Token automatically if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Global response error handler
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Don't remove token if just checking auth status, but handle unauthorized gracefully
      if (!error.config.url.includes('/auth/login') && !error.config.url.includes('/auth/register')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    return Promise.reject(error.response?.data || { success: false, error: { message: error.message } });
  }
);

// Auth endpoints
export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/password', data),
};

// Hotel endpoints
export const hotelService = {
  getAll: (params) => api.get('/hotels', { params }),
  getById: (id) => api.get(`/hotels/${id}`),
};

// City endpoints
export const cityService = {
  getAll: () => api.get('/cities'),
  getById: (id) => api.get(`/cities/${id}`),
};

// Amenity endpoints
export const amenityService = {
  getAll: () => api.get('/amenities'),
};

// Favorite endpoints
export const favoriteService = {
  getAll: () => api.get('/favorites'),
  add: (hotel_id) => api.post('/favorites', { hotel_id }),
  remove: (hotelId) => api.delete(`/favorites/${hotelId}`),
};

// Review endpoints
export const reviewService = {
  getByHotel: (hotelId) => api.get(`/reviews/hotel/${hotelId}`),
  create: (data) => api.post('/reviews', data),
};

// Loyalty endpoints
export const loyaltyService = {
  getMyBalances: () => api.get('/loyalty/my-balances'),
  getLoyaltyForHotel: (hotelId) => api.get(`/loyalty/hotel/${hotelId}`),
  redeemReward: (reward_id, hotel_id) => api.post('/loyalty/redeem', { reward_id, hotel_id }),
};

// Recommendation endpoints
export const recommendationService = {
  getRecommended: (params) => api.get('/recommendations', { params }),
};

// Comparison endpoints
export const comparisonService = {
  getSideBySide: (hotel_ids) => api.post('/comparisons/side-by-side', { hotel_ids }),
  getSaved: () => api.get('/comparisons/saved'),
  saveComparison: (title, hotel_ids) => api.post('/comparisons/saved', { title, hotel_ids }),
  deleteSaved: (id) => api.delete(`/comparisons/saved/${id}`),
};

// Booking endpoints
export const bookingService = {
  create: (data) => api.post('/bookings', data),
  getMyBookings: () => api.get('/bookings/my'),
  getById: (id) => api.get(`/bookings/${id}`),
  update: (id, data) => api.put(`/bookings/${id}`, data),
  cancel: (id) => api.put(`/bookings/${id}/cancel`),
};

// Manager endpoints
export const managerService = {
  getMyHotel: () => api.get('/manager/hotel'),
  updateMyHotel: (data) => api.put('/manager/hotel', data),
  updateCurrency: (currency) => api.put('/manager/hotel/currency', { currency }),
  uploadImage: (formData) => api.post('/manager/hotel/images', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteImage: (id) => api.delete(`/manager/hotel/images/${id}`),
  getRooms: () => api.get('/manager/rooms'),
  createRoom: (data) => api.post('/manager/rooms', data),
  updateRoom: (id, data) => api.put(`/manager/rooms/${id}`, data),
  deleteRoom: (id) => api.delete(`/manager/rooms/${id}`),
  uploadRoomImage: (roomId, formData) => api.post(`/manager/rooms/${roomId}/images`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deleteRoomImage: (roomId, imageId) => api.delete(`/manager/rooms/${roomId}/images/${imageId}`),
  updateRoomStatus: (id, status) => api.put(`/manager/rooms/${id}/status`, { status }),
  updateRoomAvailability: (id, available_rooms) => api.put(`/manager/rooms/${id}/availability`, { available_rooms }),
  getBookings: () => api.get('/manager/bookings'),
  updateBookingStatus: (id, status) => api.put(`/manager/bookings/${id}/status`, { status }),
  getPricingRules: () => api.get('/manager/pricing-rules'),
  createPricingRule: (data) => api.post('/manager/pricing-rules', data),
  updatePricingRule: (id, data) => api.put(`/manager/pricing-rules/${id}`, data),
  deletePricingRule: (id) => api.delete(`/manager/pricing-rules/${id}`),
  getFlashDeals: () => api.get('/manager/flash-deals'),
  createFlashDeal: (data) => api.post('/manager/flash-deals', data),
  updateFlashDeal: (id, data) => api.put(`/manager/flash-deals/${id}`, data),
  deleteFlashDeal: (id) => api.delete(`/manager/flash-deals/${id}`),
  getCompetitorBenchmarking: () => api.get('/manager/competitor-benchmarking'),
};

// Admin endpoints
export const adminService = {
  getAnalytics: () => api.get('/admin/analytics'),
  getUsers: () => api.get('/admin/users'),
  createUser: (data) => api.post('/admin/users', data),
  updateUserRole: (id, data) => api.put(`/admin/users/${id}/role`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getHotels: () => api.get('/admin/hotels'),
  createHotel: (data) => api.post('/admin/hotels', data),
  deleteHotel: (id) => api.delete(`/admin/hotels/${id}`),
  createCity: (data) => api.post('/admin/cities', data),
  getPendingReviews: () => api.get('/admin/reviews/pending'),
  approveReview: (id) => api.put(`/admin/reviews/${id}/approve`),
  deleteReview: (id) => api.delete(`/admin/reviews/${id}`),
};

export default api;
