import express from 'express';
import { getAllAmenities } from '../controllers/amenityController.js';

const router = express.Router();

router.get('/', getAllAmenities);

export default router;
