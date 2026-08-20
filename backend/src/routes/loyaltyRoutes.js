import express from 'express';
import { getMyLoyalty, redeemReward } from '../controllers/loyaltyController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(authenticateToken);
router.get('/me', getMyLoyalty);
router.post('/redeem', redeemReward);

export default router;
