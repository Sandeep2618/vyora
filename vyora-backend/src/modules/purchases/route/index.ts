import { Router } from 'express';
import { PurchasesController } from '../controller';
import {
  authMiddleware,
  tenantMiddleware,
  requireRoles,
  validateRequest,
} from '../../../middleware';
import { CreatePurchaseSchema } from '../validator';
import { CreateReturnSchema } from '@vyora/validation';
import { ReturnsController } from '../../returns/controller';

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
router.delete(
  '/:id',
  requireRoles('OWNER', 'ADMIN'),
  PurchasesController.softDelete,
);

router.post(
  '/:id/return',
  requireRoles('OWNER', 'ADMIN'),
  validateRequest({ body: CreateReturnSchema }),
  ReturnsController.createPurchaseReturn,
);
router.get('/:id/returns', ReturnsController.getPurchaseReturns);

export const purchasesRouter = router;
