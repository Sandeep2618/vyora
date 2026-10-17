import { Router } from 'express';
import { authRouter } from '../modules/auth';
import { businessRouter } from '../modules/business';
import { productsRouter } from '../modules/products';
import { partiesRouter } from '../modules/parties';
import { inventoryRouter } from '../modules/inventory';
import { invoicesRouter } from '../modules/invoices';
import { purchasesRouter } from '../modules/purchases';
import { paymentsRouter } from '../modules/payments';
import { expensesRouter } from '../modules/expenses';
import { dashboardRouter } from '../modules/dashboard';
import { reportsRouter } from '../modules/reports';
import { auditRouter } from '../modules/audit';
import { healthRouter } from '../modules/health';
import { appReleaseRouter } from '../modules/app';

const router = Router();

router.use('/auth', authRouter);
router.use('/business', businessRouter);
router.use('/products', productsRouter);
router.use('/parties', partiesRouter);
router.use('/inventory', inventoryRouter);
router.use('/invoices', invoicesRouter);
router.use('/purchases', purchasesRouter);
router.use('/payments', paymentsRouter);
router.use('/expenses', expensesRouter);
router.use('/dashboard', dashboardRouter);
router.use('/reports', reportsRouter);
router.use('/audit', auditRouter);
router.use('/health', healthRouter);
router.use('/app', appReleaseRouter);

export const apiRouter = router;
