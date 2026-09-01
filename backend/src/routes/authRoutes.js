import express from 'express';
import {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  deleteAccount,
  forgotPassword,
  verifySecurityAnswers,
  resetPassword,
} from '../controllers/authController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticateToken, getMe);
router.put('/profile', authenticateToken, updateProfile);
router.put('/password', authenticateToken, changePassword);
router.delete('/account', authenticateToken, deleteAccount);

router.post('/forgot-password', forgotPassword);
router.post('/verify-answers', verifySecurityAnswers);
router.post('/reset-password', resetPassword);

export default router;
