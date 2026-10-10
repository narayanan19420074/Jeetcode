import { z } from 'zod';

// Single source of truth for user preferences: the defaults (used by the
// Mongoose schema), the allowed values, and the zod schema that validates a
// PATCH /users/me/preferences body. Every field is optional on update, and the
// object is strict, so an unknown key is rejected instead of silently stored.

export const ACCENTS = ['blue', 'violet', 'emerald', 'amber', 'rose', 'cyan', 'orange'];
export const THEMES = ['light', 'dark', 'system'];
export const DENSITIES = ['comfortable', 'compact'];
export const FONT_SCALES = ['sm', 'md', 'lg'];
export const CONTRASTS = ['normal', 'high'];
export const MOTION = ['system', 'on', 'off'];
export const EDITOR_THEMES = ['auto', 'vs-dark', 'vs', 'hc-black'];
export const LANGUAGES = ['javascript', 'python', 'cpp'];

export const DEFAULT_PREFERENCES = {
  appearance: { theme: 'dark', accent: 'blue', density: 'comfortable', fontScale: 'md', contrast: 'normal', syncedAt: null },
  accessibility: { reduceMotion: 'system', underlineLinks: false },
  editor: {
    fontSize: 14,
    tabSize: 2,
    wordWrap: false,
    minimap: false,
    lineNumbers: true,
    ligatures: false,
    autoClose: true,
    theme: 'auto',
    defaultLanguage: 'javascript',
  },
  notifications: {
    streakReminder: true,
    weeklyDigest: true,
    achievements: true,
    productUpdates: false,
    reminderTime: '20:00',
    timezone: null,
  },
};

const bool = z.boolean();

export const preferencesPatchSchema = z
  .object({
    appearance: z
      .object({
        theme: z.enum(THEMES),
        accent: z.enum(ACCENTS),
        density: z.enum(DENSITIES),
        fontScale: z.enum(FONT_SCALES),
        contrast: z.enum(CONTRASTS),
      })
      .partial()
      .strict(),
    accessibility: z.object({ reduceMotion: z.enum(MOTION), underlineLinks: bool }).partial().strict(),
    editor: z
      .object({
        fontSize: z.number().int().min(10).max(28),
        tabSize: z.union([z.literal(2), z.literal(4), z.literal(8)]),
        wordWrap: bool,
        minimap: bool,
        lineNumbers: bool,
        ligatures: bool,
        autoClose: bool,
        theme: z.enum(EDITOR_THEMES),
        defaultLanguage: z.enum(LANGUAGES),
      })
      .partial()
      .strict(),
    notifications: z
      .object({
        streakReminder: bool,
        weeklyDigest: bool,
        achievements: bool,
        productUpdates: bool,
        reminderTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Use HH:MM (24h)'),
        timezone: z.string().trim().max(64).nullable(),
      })
      .partial()
      .strict(),
  })
  .partial()
  .strict();
