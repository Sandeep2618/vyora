import { Router } from 'express';
import { ExpensesController } from '../controller';
import {
  authMiddleware,
  tenantMiddleware,
  validateRequest,
} from '../../../middleware';
import { CreateExpenseSchema } from '../validator';

const router = Router();

router.use(authMiddleware, tenantMiddleware);

router.post(
  '/',
  validateRequest({ body: CreateExpenseSchema }),
  ExpensesController.create,
);

router.get('/', ExpensesController.findAll);
router.get('/categories', ExpensesController.getCategories);
router.delete('/:id', ExpensesController.remove);

export const expensesRouter = router;
