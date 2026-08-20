import express from 'express';
import { getHotelReviews, createReview } from '../controllers/reviewController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/hotel/:hotelId', getHotelReviews);
router.post('/', authenticateToken, createReview);

export default router;
