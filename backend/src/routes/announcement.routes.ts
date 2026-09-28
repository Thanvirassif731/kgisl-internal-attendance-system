import { Router } from 'express';
import {
  getAllAnnouncements,
  getAnnouncementById,
  createAnnouncement,
  updateAnnouncement,
  repostAnnouncement,
  deleteAnnouncement,
} from '../controllers/announcement.controller';
import { authenticateJWT } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/role.middleware';
import { validateRequest } from '../middleware/validate.middleware';
import {
  createAnnouncementSchema,
  updateAnnouncementSchema,
} from '../validators/schema.validators';

const router = Router();

router.use(authenticateJWT);

// Available to all authenticated users
router.get('/', getAllAnnouncements);
router.get('/:id', getAnnouncementById);

// Admin-only management
router.post('/', requireAdmin, validateRequest(createAnnouncementSchema), createAnnouncement);
router.put('/:id', requireAdmin, validateRequest(updateAnnouncementSchema), updateAnnouncement);
router.post('/:id/repost', requireAdmin, repostAnnouncement);
router.delete('/:id', requireAdmin, deleteAnnouncement);

export default router;
