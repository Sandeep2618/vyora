import { Router } from 'express';
import { BackupController } from '../controller';
import {
  authMiddleware,
  tenantMiddleware,
  requireRoles,
} from '../../../middleware';

const router = Router();

router.use(authMiddleware, tenantMiddleware);

// Only Business Owners and Store Managers can generate and export tenant cloud backups
router.get('/export', requireRoles('OWNER', 'ADMIN'), BackupController.export);

export const backupRouter = router;
