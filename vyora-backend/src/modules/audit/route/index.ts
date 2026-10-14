import { Router } from 'express';
import { AuditController } from '../controller';
import { authMiddleware, tenantMiddleware, requireRoles } from '../../../middleware';

const router = Router();

router.use(authMiddleware, tenantMiddleware);

router.get('/', requireRoles('OWNER', 'ADMIN'), AuditController.getLogs);

export const auditRouter = router;
