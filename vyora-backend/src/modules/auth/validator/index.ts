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
