import express from 'express';
import {
  getMyHotel,
  updateMyHotel,
  getMyRooms,
  createRoom,
  updateRoom,
  deleteRoom,
  getMyBookings,
  updateBookingStatus,
  getPricingRules,
  createPricingRule,
  updatePricingRule,
  deletePricingRule,
  getFlashDeals,
  createFlashDeal,
  updateFlashDeal,
  deleteFlashDeal,
  getCompetitorBenchmarking,
} from '../controllers/managerController.js';
import { authenticateToken, requireRole } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(authenticateToken, requireRole('manager', 'hotel_manager'));

// Hotel
router.get('/hotel', getMyHotel);
router.put('/hotel', updateMyHotel);
router.get('/competitor-benchmarking', getCompetitorBenchmarking);

// Rooms
router.get('/rooms', getMyRooms);
router.post('/rooms', createRoom);
router.put('/rooms/:id', updateRoom);
router.delete('/rooms/:id', deleteRoom);

// Bookings
router.get('/bookings', getMyBookings);
router.put('/bookings/:id/status', updateBookingStatus);

// Pricing Rules
router.get('/pricing-rules', getPricingRules);
router.post('/pricing-rules', createPricingRule);
router.put('/pricing-rules/:id', updatePricingRule);
router.delete('/pricing-rules/:id', deletePricingRule);

// Flash Deals
router.get('/flash-deals', getFlashDeals);
router.post('/flash-deals', createFlashDeal);
router.put('/flash-deals/:id', updateFlashDeal);
router.delete('/flash-deals/:id', deleteFlashDeal);

export default router;
