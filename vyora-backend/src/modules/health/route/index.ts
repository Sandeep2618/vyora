import { Router } from 'express';
import { HealthController } from '../controller';

const router = Router();

router.get('/', HealthController.check);
router.get('/diagnostics', HealthController.diagnostics);

export const healthRouter = router;
