import express from 'express';
import {
  getAnalytics,
  getAllUsers,
  updateUserRole,
  getAllHotels,
  createHotel,
  updateHotel,
  resetHotelPassword,
  toggleHotelStatus,
  deleteHotel,
  createCity,
  getPendingReviews,
  approveReview,
  deleteReview,
} from '../controllers/adminController.js';
import { authenticateToken, requireRole } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(authenticateToken, requireRole('admin', 'system_admin'));

router.get('/analytics', getAnalytics);

// Users (retained for test compatibility)
router.get('/users', getAllUsers);
router.put('/users/:id/role', updateUserRole);

// Hotels & Login Account Management (1 Hotel = 1 Login Account)
router.get('/hotels', getAllHotels);
router.post('/hotels', createHotel);
router.put('/hotels/:id', updateHotel);
router.put('/hotels/:id/reset-password', resetHotelPassword);
router.put('/hotels/:id/toggle-status', toggleHotelStatus);
router.delete('/hotels/:id', deleteHotel);

// Cities
router.post('/cities', createCity);

// Reviews
router.get('/reviews/pending', getPendingReviews);
router.put('/reviews/:id/approve', approveReview);
router.delete('/reviews/:id', deleteReview);

export default router;
