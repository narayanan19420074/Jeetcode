import { z } from 'zod';

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  // Empty string / null clears the avatar back to initials-only.
  avatarUrl: z.string().trim().url('Must be a valid URL').max(500).nullable().optional().or(z.literal('')),
});

// currentPassword is optional at the schema level because OAuth-only
// accounts have no existing password to confirm — the controller enforces
// it conditionally based on whether the user actually has one.
export const changePasswordSchema = z.object({
  currentPassword: z.string().optional(),
  newPassword: z.string().min(8, 'Password must be at least 8 characters').max(128),
});
