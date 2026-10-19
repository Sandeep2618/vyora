import { z } from 'zod';
import { RegisterSchema, LoginSchema } from '@vyora/validation';
export type { RegisterInput, LoginInput } from '@vyora/validation';

export { RegisterSchema, LoginSchema };

export const SendOtpSchema = z.object({
  phone: z.string().min(10, 'Valid 10-digit phone number is required'),
});
export type SendOtpInput = z.infer<typeof SendOtpSchema>;

export const VerifyOtpSchema = z.object({
  phone: z.string().min(10, 'Valid 10-digit phone number is required'),
  otp: z.string().length(6, 'OTP must be 6 digits'),
  name: z.string().optional(),
});
export type VerifyOtpInput = z.infer<typeof VerifyOtpSchema>;

export const SelectContextSchema = z.object({
  contextType: z.enum(['OWNER', 'STAFF', 'CUSTOMER']),
  businessId: z.string().optional(),
});
export type SelectContextInput = z.infer<typeof SelectContextSchema>;

export const ForgotPasswordSchema = z.object({
  identifier: z.string().min(3, 'Email or 10-digit mobile number is required'),
});
export type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>;

export const VerifyResetCodeSchema = z.object({
  identifier: z.string().min(3, 'Email or 10-digit mobile number is required'),
  code: z.string().length(6, 'Verification code must be 6 digits'),
});
export type VerifyResetCodeInput = z.infer<typeof VerifyResetCodeSchema>;

export const ResetPasswordSchema = z.object({
  identifier: z.string().min(3, 'Registered email or mobile identifier is required'),
  code: z.string().length(6, '6-digit verification code is required'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
});
export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>;

export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
});
export type ChangePasswordInput = z.infer<typeof ChangePasswordSchema>;

