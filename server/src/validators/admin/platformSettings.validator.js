import { z } from 'zod';

export const setProForEveryoneSchema = z.object({
  enabled: z.boolean(),
});
