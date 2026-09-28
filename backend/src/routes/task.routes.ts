import { Router } from 'express';
import {
  getUserTasks,
  getAdminTasks,
  getTaskById,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
} from '../controllers/task.controller';
import { authenticateJWT } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/role.middleware';
import { validateRequest } from '../middleware/validate.middleware';
import {
  createTaskSchema,
  updateTaskSchema,
} from '../validators/schema.validators';

const router = Router();

router.use(authenticateJWT);

// Admin monitoring endpoint
router.get('/admin/all', requireAdmin, getAdminTasks);

// User tasks (and admin creating/viewing own or assigned)
router.get('/', getUserTasks);
router.post('/', validateRequest(createTaskSchema), createTask);
router.get('/:id', getTaskById);
router.put('/:id', validateRequest(updateTaskSchema), updateTask);
router.patch('/:id/status', updateTaskStatus);
router.delete('/:id', deleteTask);

export default router;
