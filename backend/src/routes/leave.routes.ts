import { Router } from 'express';
import {
  submitLeaveRequest,
  getMyLeaveRequests,
  getAdminLeaveRequests,
  approveLeaveRequest,
  rejectLeaveRequest,
} from '../controllers/leave.controller';
import { authenticateJWT } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/role.middleware';
import { validateRequest } from '../middleware/validate.middleware';
import { createLeaveRequestSchema } from '../validators/schema.validators';

const router = Router();

router.use(authenticateJWT);

// User routes
router.post('/', validateRequest(createLeaveRequestSchema), submitLeaveRequest);
router.get('/me', getMyLeaveRequests);

// Admin routes
router.get('/admin/all', requireAdmin, getAdminLeaveRequests);
router.patch('/admin/:id/approve', requireAdmin, approveLeaveRequest);
router.patch('/admin/:id/reject', requireAdmin, rejectLeaveRequest);

export default router;
