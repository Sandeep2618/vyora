import { Router } from 'express';
import { ReportsController } from '../controller';
import { authMiddleware, tenantMiddleware } from '../../../middleware';

const router = Router();

router.use(authMiddleware, tenantMiddleware);

router.get('/sales-register', ReportsController.getSalesRegister);
router.get('/purchase-register', ReportsController.getPurchaseRegister);
router.get('/stock-summary', ReportsController.getStockSummary);
router.get('/customer-dues', ReportsController.getCustomerDues);
router.get('/expense-summary', ReportsController.getExpenseSummary);

export const reportsRouter = router;
