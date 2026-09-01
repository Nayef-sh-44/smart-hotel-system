import { z } from 'zod';

export const registerSchema = z.object({
  full_name: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone_number: z.string().optional().nullable(),
  preferred_currency: z.string().length(3, 'Currency must be a 3-letter ISO code').default('EUR'),
  role: z.enum(['customer', 'user', 'manager', 'hotel_manager', 'admin', 'system_admin']).optional().default('user'),
  hotel_id: z.number().int().optional().nullable(),
  security_question_1: z.string().min(1, 'Security question 1 is required').optional(),
  security_answer_1: z.string().min(1, 'Security answer 1 is required').optional(),
  security_question_2: z.string().min(1, 'Security question 2 is required').optional(),
  security_answer_2: z.string().min(1, 'Security answer 2 is required').optional(),
}).refine(data => {
  if (data.security_question_1 && data.security_question_2) {
    return data.security_question_1 !== data.security_question_2;
  }
  return true;
}, {
  message: "Security questions must be different",
  path: ["security_question_2"]
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const updateProfileSchema = z.object({
  full_name: z.string().min(2).optional(),
  phone_number: z.string().optional().nullable(),
  preferred_currency: z.string().length(3).optional(),
});

export const changePasswordSchema = z.object({
  current_password: z.string().min(1, 'Current password is required'),
  new_password: z.string().min(6, 'New password must be at least 6 characters'),
});
