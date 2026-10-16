import { Router } from 'express';
import { ProductsController } from '../controller';
import {
  authMiddleware,
  tenantMiddleware,
  requireRoles,
  validateRequest,
} from '../../../middleware';
import { ProductSchema } from '../validator';

const router = Router();

router.use(authMiddleware, tenantMiddleware);

router.post(
  '/',
  requireRoles('OWNER', 'ADMIN'),
  validateRequest({ body: ProductSchema }),
  ProductsController.create,
);

router.get('/', ProductsController.findAll);
router.post('/paging', ProductsController.findAll);
router.get('/:id', ProductsController.findOne);
router.put(
  '/:id',
  requireRoles('OWNER', 'ADMIN'),
  validateRequest({ body: ProductSchema }),
  ProductsController.update,
);
router.patch(
  '/:id/stock',
  requireRoles('OWNER', 'ADMIN'),
  ProductsController.adjustStock,
);
router.delete(
  '/:id',
  requireRoles('OWNER', 'ADMIN'),
  ProductsController.delete,
);

export const productsRouter = router;
