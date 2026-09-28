import { Router } from 'express';
import {
  getAllTeams,
  getTeamById,
  createTeam,
  updateTeam,
  deleteTeam,
} from '../controllers/team.controller';
import { authenticateJWT } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/role.middleware';
import { validateRequest } from '../middleware/validate.middleware';
import { createTeamSchema } from '../validators/schema.validators';

const router = Router();

router.use(authenticateJWT);

// Both Admin and Users can view teams
router.get('/', getAllTeams);
router.get('/:id', getTeamById);

// Admin-only management
router.post('/', requireAdmin, validateRequest(createTeamSchema), createTeam);
router.put('/:id', requireAdmin, updateTeam);
router.delete('/:id', requireAdmin, deleteTeam);

export default router;
