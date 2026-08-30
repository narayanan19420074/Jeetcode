import { z } from 'zod';

export const activateLicenseSchema = z.object({
  licenseKey: z.string().trim().min(1),
});

export const generateLicensesSchema = z.object({
  count: z.number().int().min(1).max(500).default(1),
  expiresAt: z.string().datetime().optional(),
  note: z.string().max(200).optional(),
});
