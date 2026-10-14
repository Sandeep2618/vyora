import { Router } from 'express';
import { InventoryController } from '../controller';
import {
  authMiddleware,
  tenantMiddleware,
  requireRoles,
  validateRequest,
} from '../../../middleware';
import { StockAdjustmentSchema } from '../validator';

const router = Router();

router.use(authMiddleware, tenantMiddleware);

router.post(
  '/adjust',
  requireRoles('OWNER', 'ADMIN'),
  validateRequest({ body: StockAdjustmentSchema }),
  InventoryController.adjustStock,
);
router.post(
  '/adjustments',
  requireRoles('OWNER', 'ADMIN'),
  validateRequest({ body: StockAdjustmentSchema }),
  InventoryController.adjustStock,
);
router.get('/movements', InventoryController.getMovements);
router.get('/ledger/:productId', InventoryController.getLedger);

export const inventoryRouter = router;
