import { Router } from 'express';
import { AuthController } from '../controller';
import { authMiddleware, validateRequest } from '../../../middleware';
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
router.patch('/profile', authMiddleware, AuthController.updateProfile);
router.post('/logout', authMiddleware, AuthController.logout);

export const authRouter = router;
