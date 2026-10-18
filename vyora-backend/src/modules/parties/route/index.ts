import { Router } from 'express';
import { PartiesController } from '../controller';
import {
  authMiddleware,
  tenantMiddleware,
  requireRoles,
  validateRequest,
} from '../../../middleware';
import { PartySchema } from '../validator';

const router = Router();

router.use(authMiddleware, tenantMiddleware);

router.post(
  '/',
  requireRoles('OWNER', 'ADMIN'),
  validateRequest({ body: PartySchema }),
  PartiesController.create,
);
router.get('/', PartiesController.findAll);
router.get('/export', PartiesController.exportCsv);
router.get('/:id', PartiesController.findOne);
router.put(
  '/:id',
  requireRoles('OWNER', 'ADMIN'),
  validateRequest({ body: PartySchema }),
  PartiesController.update,
);
router.delete(
  '/:id',
  requireRoles('OWNER', 'ADMIN'),
  PartiesController.delete,
);

export const partiesRouter = router;
