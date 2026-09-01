import express from 'express';
import { getMyBalances, getLoyaltyForHotel, redeemReward } from '../controllers/loyaltyController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(authenticateToken);
router.get('/my-balances', getMyBalances);
router.get('/hotel/:hotelId', getLoyaltyForHotel);
router.post('/redeem', redeemReward);

export default router;
