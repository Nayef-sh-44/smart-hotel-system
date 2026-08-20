import express from 'express';
import {
  getUserFavorites,
  addFavorite,
  removeFavorite,
} from '../controllers/favoriteController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(authenticateToken);
router.get('/', getUserFavorites);
router.post('/', addFavorite);
router.delete('/:hotelId', removeFavorite);

export default router;
