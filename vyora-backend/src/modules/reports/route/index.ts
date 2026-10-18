import { Router } from 'express';
import { ReportsController } from '../controller';
import { authMiddleware, tenantMiddleware } from '../../../middleware';

const router = Router();

router.use(authMiddleware, tenantMiddleware);

router.get('/sales-register', ReportsController.getSalesRegister);
router.get('/sales-register/export', ReportsController.exportSalesRegisterCsv);
router.get('/purchase-register', ReportsController.getPurchaseRegister);
router.get('/purchase-register/export', ReportsController.exportPurchaseRegisterCsv);
router.get('/stock-summary', ReportsController.getStockSummary);
router.get('/stock-summary/export', ReportsController.exportStockSummaryCsv);
router.get('/customer-dues', ReportsController.getCustomerDues);
router.get('/customer-dues/export', ReportsController.exportCustomerDuesCsv);
router.get('/expense-summary', ReportsController.getExpenseSummary);
router.get('/expense-summary/export', ReportsController.exportExpenseSummaryCsv);

export const reportsRouter = router;
