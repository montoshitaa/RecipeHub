import { Router } from 'express';
import { register, login, refresh, logout, getMe, updateProfile } from '../controllers/authController';
import { protect } from '../middlewares/auth.middleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refresh);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.patch('/me', protect, updateProfile);

export default router;
