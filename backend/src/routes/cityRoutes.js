import express from 'express';
import { getAllCities, getCityById } from '../controllers/cityController.js';

const router = express.Router();

router.get('/', getAllCities);
router.get('/:id', getCityById);

export default router;
