import { Router } from 'express';
import { TrashController } from '../controller';
import {
  authMiddleware,
  tenantMiddleware,
  requireRoles,
} from '../../../middleware';

const router = Router();

router.use(authMiddleware, tenantMiddleware);

// Only Business Owners and Store Managers can view Recycle Bin & restore deleted data
router.get('/', requireRoles('OWNER', 'ADMIN'), TrashController.list);
router.post('/restore', requireRoles('OWNER', 'ADMIN'), TrashController.restore);
router.post('/restore-batch', requireRoles('OWNER', 'ADMIN'), TrashController.restoreBatch);

export const trashRouter = router;
