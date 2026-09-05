import express from 'express';
import { getAllHotels, getHotelById, getPricePreview, getNearbyServices } from '../controllers/hotelController.js';

const router = express.Router();

router.get('/', getAllHotels);
router.get('/:id/price-preview', getPricePreview);
router.get('/:id/nearby-services', getNearbyServices);
router.get('/:id', getHotelById);

export default router;
