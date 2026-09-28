import { Router } from 'express';
import {
  checkIn,
  checkOut,
  getMyTodayAttendance,
  getMyAttendanceHistory,
  getAdminAttendance,
} from '../controllers/attendance.controller';
import { authenticateJWT } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/role.middleware';

const router = Router();

router.use(authenticateJWT);

// User endpoints
router.post('/check-in', checkIn);
router.post('/check-out', checkOut);
router.get('/me/today', getMyTodayAttendance);
router.get('/me', getMyAttendanceHistory);

// Admin monitoring
router.get('/admin/all', requireAdmin, getAdminAttendance);

export default router;
