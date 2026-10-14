import { z } from 'zod';

const httpUrl = (max) =>
  z
    .string()
    .trim()
    .max(max)
    .refine((v) => {
      try {
        const u = new URL(v);
        return u.protocol === 'http:' || u.protocol === 'https:';
      } catch {
        return false;
      }
    }, 'Must be a valid http(s) URL');

// Our own uploaded-avatar path (see uploadAvatar in user.controller.js).
const localAvatarPath = z.string().regex(/^\/api\/users\/avatar\/[a-f0-9]{24}(?:\?v=\d+)?$/);

// '' clears the field.
const optionalUrl = (max) => z.union([z.literal(''), httpUrl(max)]);

const socialSchema = z
  .object({
    github: z.union([z.literal(''), z.string().trim().regex(/^[A-Za-z0-9](?:[A-Za-z0-9-]{0,38})$/, 'Invalid GitHub username')]),
    linkedin: z.union([z.literal(''), z.string().trim().regex(/^[A-Za-z0-9_%-]{2,100}$/, 'Use the part after linkedin.com/in/')]),
    x: z.union([z.literal(''), z.string().trim().regex(/^[A-Za-z0-9_]{1,15}$/, 'Invalid X username')]),
    leetcode: z.union([z.literal(''), z.string().trim().regex(/^[A-Za-z0-9_-]{2,40}$/, 'Invalid username')]),
  })
  .partial()
  .strict();

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  // Empty string / null clears the avatar back to initials-only.
  avatarUrl: z.union([z.literal(''), z.null(), localAvatarPath, httpUrl(500)]).optional(),
  bio: z.string().trim().max(160).optional(),
  location: z.string().trim().max(60).optional(),
  company: z.string().trim().max(60).optional(),
  website: optionalUrl(200).optional(),
  socials: socialSchema.optional(),
});

// Client resizes to ~256px and sends a data URL; the controller re-checks size + magic bytes.
export const uploadAvatarSchema = z.object({
  image: z
    .string()
    .max(250_000)
    .regex(/^data:image\/(?:jpeg|png|webp);base64,[A-Za-z0-9+/]+=*$/, 'Upload a JPG, PNG or WebP image'),
});

// currentPassword is optional at the schema level because OAuth-only
// accounts have no existing password to confirm — the controller enforces
// it conditionally based on whether the user actually has one.
export const changePasswordSchema = z.object({
  currentPassword: z.string().optional(),
  newPassword: z.string().min(8, 'Password must be at least 8 characters').max(128),
});

export const changeHandleSchema = z.object({
  handle: z
    .string()
    .trim()
    .toLowerCase()
    .min(3, 'At least 3 characters')
    .max(30, 'At most 30 characters')
    .regex(/^[a-z0-9_]+$/, 'Only lowercase letters, numbers and underscores'),
});

export const deleteAccountSchema = z.object({
  confirm: z.string().trim().toLowerCase(),
  password: z.string().optional(),
});

export { preferencesPatchSchema } from '../config/preferences.js';
