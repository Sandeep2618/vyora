import { Router } from 'express';
import { PaymentsController } from '../controller';
import {
  authMiddleware,
  tenantMiddleware,
  requireRoles,
  validateRequest,
} from '../../../middleware';
import { CreatePaymentSchema } from '../validator';

const router = Router();

router.use(authMiddleware, tenantMiddleware);

router.post(
  '/',
  requireRoles('OWNER', 'ADMIN'),
  validateRequest({ body: CreatePaymentSchema }),
  PaymentsController.create,
);

router.get('/', PaymentsController.findAll);
router.get('/:id', PaymentsController.findOne);

export const paymentsRouter = router;
