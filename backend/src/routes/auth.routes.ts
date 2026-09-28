import { Router } from 'express';
import { login, getMe, logout, updateProfile } from '../controllers/auth.controller';
import { authenticateJWT } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validate.middleware';
import { loginSchema } from '../validators/schema.validators';

const router = Router();

router.post('/login', validateRequest(loginSchema), login);
router.post('/logout', authenticateJWT, logout);
router.get('/me', authenticateJWT, getMe);
router.put('/profile', authenticateJWT, updateProfile);

export default router;
