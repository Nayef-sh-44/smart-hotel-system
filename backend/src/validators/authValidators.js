import { z } from 'zod';

export const registerSchema = z.object({
  full_name: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone_number: z.string().optional().nullable(),
  preferred_currency: z.string().length(3, 'Currency must be a 3-letter ISO code').default('EUR'),
  role: z.enum(['customer', 'user', 'manager', 'hotel_manager', 'admin', 'system_admin']).optional().default('user'),
  hotel_id: z.number().int().optional().nullable(),
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
