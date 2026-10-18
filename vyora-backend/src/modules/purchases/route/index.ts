import { Router } from 'express';
import { PurchasesController } from '../controller';
import {
  authMiddleware,
  tenantMiddleware,
  requireRoles,
  validateRequest,
} from '../../../middleware';
import { CreatePurchaseSchema } from '../validator';

const router = Router();

router.use(authMiddleware, tenantMiddleware);

router.post(
  '/',
  requireRoles('OWNER', 'ADMIN'),
  validateRequest({ body: CreatePurchaseSchema }),
  PurchasesController.create,
);

router.get('/', PurchasesController.findAll);
router.get('/export', PurchasesController.exportCsv);
router.get('/:id', PurchasesController.findOne);

export const purchasesRouter = router;
