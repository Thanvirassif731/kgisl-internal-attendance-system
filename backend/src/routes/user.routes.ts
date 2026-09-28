import { Router } from 'express';
import {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  toggleUserStatus,
  resetUserPassword,
} from '../controllers/user.controller';
import { authenticateJWT } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/role.middleware';
import { validateRequest } from '../middleware/validate.middleware';
import {
  createUserSchema,
  updateUserSchema,
  resetPasswordSchema,
} from '../validators/schema.validators';

const router = Router();

// Protect all routes with JWT and Admin check
router.use(authenticateJWT);
router.use(requireAdmin);

router.post('/', validateRequest(createUserSchema), createUser);
router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.put('/:id', validateRequest(updateUserSchema), updateUser);
router.delete('/:id', deleteUser);
router.patch('/:id/status', toggleUserStatus);
router.post('/:id/reset-password', validateRequest(resetPasswordSchema), resetUserPassword);

export default router;
