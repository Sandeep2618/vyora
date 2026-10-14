import { Router } from 'express';
import { BusinessController } from '../controller';
import {
  authMiddleware,
  tenantMiddleware,
  requireRoles,
  validateRequest,
} from '../../../middleware';
import { BusinessProfileSchema } from '../validator';

const router = Router();

// All business routes require valid authentication and business context
router.use(authMiddleware, tenantMiddleware);

router.get('/current', BusinessController.getCurrent);
router.put(
  '/current',
  requireRoles('OWNER', 'ADMIN'),
  validateRequest({ body: BusinessProfileSchema }),
  BusinessController.updateCurrent,
);
router.put('/plan', requireRoles('OWNER', 'ADMIN'), BusinessController.updatePlan);
router.put(
  '/permissions',
  requireRoles('OWNER', 'ADMIN'),
  BusinessController.updatePermissions,
);

router.get('/staff', BusinessController.getStaff);
router.post('/staff', requireRoles('OWNER', 'ADMIN'), BusinessController.addStaff);
router.patch(
  '/staff/:id/role',
  requireRoles('OWNER', 'ADMIN'),
  BusinessController.updateStaffRole,
);
router.patch(
  '/staff/:id/status',
  requireRoles('OWNER', 'ADMIN'),
  BusinessController.toggleStaffStatus,
);
router.delete(
  '/staff/:id',
  requireRoles('OWNER', 'ADMIN'),
  BusinessController.removeStaff,
);

export const businessRouter = router;
