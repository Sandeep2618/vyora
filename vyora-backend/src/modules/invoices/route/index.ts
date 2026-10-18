import { Router } from 'express';
import { InvoicesController } from '../controller';
import {
  authMiddleware,
  tenantMiddleware,
  requireRoles,
  validateRequest,
} from '../../../middleware';
import { CreateInvoiceSchema, CancelInvoiceSchema } from '../validator';

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

export const invoicesRouter = router;
