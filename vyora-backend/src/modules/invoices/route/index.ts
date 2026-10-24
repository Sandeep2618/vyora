import { Router } from 'express';
import { InvoicesController } from '../controller';
import {
  authMiddleware,
  tenantMiddleware,
  requireRoles,
  validateRequest,
} from '../../../middleware';
import { CreateInvoiceSchema, CancelInvoiceSchema, CreateReturnSchema } from '@vyora/validation';
import { ReturnsController } from '../../returns/controller';

const router = Router();

router.use(authMiddleware, tenantMiddleware);

router.post('/preview', InvoicesController.preview);
router.post(
  '/',
  requireRoles('OWNER', 'ADMIN'),
  validateRequest({ body: CreateInvoiceSchema }),
  InvoicesController.create,
);
router.get('/', InvoicesController.findAll);
router.get('/export', InvoicesController.exportCsv);
router.get('/:id', InvoicesController.findOne);
router.post(
  '/:id/finalize',
  requireRoles('OWNER', 'ADMIN'),
  InvoicesController.finalize,
);
router.post(
  '/:id/cancel',
  requireRoles('OWNER', 'ADMIN'),
  validateRequest({ body: CancelInvoiceSchema }),
  InvoicesController.cancel,
);
router.delete(
  '/:id',
  requireRoles('OWNER', 'ADMIN'),
  InvoicesController.softDelete,
);
router.post(
  '/:id/return',
  requireRoles('OWNER', 'ADMIN'),
  validateRequest({ body: CreateReturnSchema }),
  ReturnsController.createInvoiceReturn,
);
router.get('/:id/returns', ReturnsController.getInvoiceReturns);

export const invoicesRouter = router;
