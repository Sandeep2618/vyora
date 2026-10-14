import { Router } from 'express';
import { DashboardController } from '../controller';
import { authMiddleware, tenantMiddleware } from '../../../middleware';

const router = Router();

router.use(authMiddleware, tenantMiddleware);

router.get('/metrics', DashboardController.getMetrics);

export const dashboardRouter = router;
