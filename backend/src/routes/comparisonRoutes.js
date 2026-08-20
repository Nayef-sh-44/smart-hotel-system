import express from 'express';
import {
  getSideBySideComparison,
  getSavedComparisons,
  createSavedComparison,
  deleteSavedComparison,
} from '../controllers/comparisonController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/side-by-side', getSideBySideComparison);
router.get('/saved', authenticateToken, getSavedComparisons);
router.post('/saved', authenticateToken, createSavedComparison);
router.delete('/saved/:id', authenticateToken, deleteSavedComparison);

export default router;
