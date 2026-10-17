import { Router } from 'express';
import { AuthController } from '../controller';
import { authMiddleware, validateRequest } from '../../../middleware';
import { asyncHandler, ApiResponse } from '../../../util';
import { MailService } from '../../mail/mail.service';
import {
  RegisterSchema,
  LoginSchema,
  SendOtpSchema,
  VerifyOtpSchema,
  SelectContextSchema,
} from '../validator';

const router = Router();

router.post('/register', validateRequest({ body: RegisterSchema }), AuthController.register);
router.post('/login', validateRequest({ body: LoginSchema }), AuthController.login);
router.post('/otp/send', validateRequest({ body: SendOtpSchema }), AuthController.sendOtp);
router.post('/otp/verify', validateRequest({ body: VerifyOtpSchema }), AuthController.verifyOtp);

router.get('/personas', authMiddleware, AuthController.getPersonas);
router.post(
  '/select-context',
  authMiddleware,
  validateRequest({ body: SelectContextSchema }),
  AuthController.selectContext,
);
router.get('/me', authMiddleware, AuthController.getProfile);
router.put('/profile', authMiddleware, AuthController.updateProfile);
router.patch('/profile', authMiddleware, AuthController.updateProfile);
router.get('/businesses', authMiddleware, AuthController.getMyBusinesses);
router.get('/my-businesses', authMiddleware, AuthController.getMyBusinesses);
router.post('/switch-business', authMiddleware, AuthController.switchBusiness);
router.post('/accept-invite', authMiddleware, AuthController.acceptInvite);
router.post('/logout', authMiddleware, AuthController.logout);

// Welcome email trigger route
router.post(
  '/welcome',
  asyncHandler(async (req, res) => {
    const { email, name, businessName } = req.body || {};
    if (email && !email.endsWith('@vyora.in')) {
      MailService.sendWelcomeEmail({
        to: email,
        name: name || 'Valued Partner',
        businessName,
      }).catch(() => {});
    }
    return ApiResponse.success(res, { success: true, message: 'Welcome email triggered' });
  }),
);

export const authRouter = router;

