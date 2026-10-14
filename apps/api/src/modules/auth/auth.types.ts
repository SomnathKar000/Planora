// ────────────────────────────────────────────────────────────────
// Planora API — Auth Module Types
// ────────────────────────────────────────────────────────────────

import type { User, SpatialFocus } from '@planora/domain';
import { z } from 'zod';

export interface UserRecord extends User {
  passwordHash: string;
}

export const RegisterDtoSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  role: z.string().optional().default('Architectural Practice / BIM CAD'),
});

export type RegisterDto = z.infer<typeof RegisterDtoSchema>;

export const LoginDtoSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional().default(false),
});

export type LoginDto = z.infer<typeof LoginDtoSchema>;

export interface AuthResponse {
  user: User;
  token: string;
  expiresIn: number;
}
