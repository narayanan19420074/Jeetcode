import { z } from 'zod';

export const applySchema = z.object({
  acceptedRules: z.literal(true, { error: 'You must accept the contest rules' }),
});
