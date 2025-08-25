import { Router } from 'express';
import { register, login, getMe, refreshToken, forgotPassword, resetPassword, verifyEmail } from '../controllers/authController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/refresh-token', refreshToken);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/verify-email', verifyEmail);

// Protected routes
router.get('/me', authMiddleware, getMe);

export default router;
