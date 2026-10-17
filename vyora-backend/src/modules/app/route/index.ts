import { Router } from 'express';
import { AppReleaseController } from '../controller';
import { authMiddleware, requireRoles } from '../../../middleware';

const router = Router();

// Public endpoints - accessed by mobile app on launch/menu
router.get('/version-info', AppReleaseController.getLatestRelease);
router.get('/release-notes', AppReleaseController.getLatestRelease);

// Protected endpoint - update or publish new release notes
router.post(
  '/release-notes',
  authMiddleware,
  requireRoles('OWNER', 'ADMIN'),
  AppReleaseController.publishRelease,
);

export const appReleaseRouter = router;
