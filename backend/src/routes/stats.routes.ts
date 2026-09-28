import { Router } from 'express';
import {
  getAdminDashboardStats,
  getUserDashboardStats,
} from '../controllers/stats.controller';
import { authenticateJWT } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/role.middleware';

const router = Router();

router.use(authenticateJWT);

router.get('/admin', requireAdmin, getAdminDashboardStats);
router.get('/user', getUserDashboardStats);

export default router;
