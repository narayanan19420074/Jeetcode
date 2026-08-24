import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

// Fail fast on boot if config is wrong, rather than failing mysteriously
// mid-request once 10L users are hitting the API.
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(5000),

  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required (MongoDB Atlas connection string)'),

  JWT_ACCESS_SECRET: z.string().min(16, 'JWT_ACCESS_SECRET must be at least 16 chars'),
  JWT_REFRESH_SECRET: z.string().min(16, 'JWT_REFRESH_SECRET must be at least 16 chars'),
  JWT_ACCESS_EXPIRY: z.string().default('15m'),
  JWT_REFRESH_EXPIRY: z.string().default('30d'),

  CLIENT_ORIGIN: z.string().default('http://localhost:5173'),

  // Judge0 — public cloud API by default; swap JUDGE0_API_URL to a
  // self-hosted instance later without touching any calling code.
  JUDGE0_API_URL: z.string().default('https://ce.judge0.com'),
  JUDGE0_API_KEY: z.string().optional(),
  JUDGE0_API_HOST: z.string().optional(),

  // Redis is optional in dev — the queue service falls back to inline
  // (synchronous) processing when it's not configured, so `npm run dev`
  // works with zero extra infra. Set it in production for real queuing.
  REDIS_URL: z.string().optional(),

  // AI hint drawer. Optional — if unset, /api/ai/hint returns a clear
  // "not configured" error instead of failing mysteriously.
  //
  // GEMINI_API_KEY is checked first — Google's Gemini API has a genuine
  // free tier (get a key at https://aistudio.google.com/apikey, no credit
  // card required for the free tier as of this writing). Falls back to
  // ANTHROPIC_API_KEY if Gemini isn't configured but Anthropic is.
  GEMINI_API_KEY: z.string().optional(),
  GEMINI_MODEL: z.string().default('gemini-2.0-flash'),

  ANTHROPIC_API_KEY: z.string().optional(),
  ANTHROPIC_MODEL: z.string().default('claude-haiku-4-5-20251001'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment configuration:');
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
export const isProd = env.NODE_ENV === 'production';
