import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

// The isolated code-execution service (see judgeServer.js) runs this same code base but must NOT
// hold database or auth secrets, so those become unused placeholders when JUDGE_SERVICE=true.
const judgeService = process.env.JUDGE_SERVICE === 'true';
const mongoUri = judgeService ? z.string().default('unused') : z.string().min(1, 'MONGODB_URI is required (MongoDB Atlas connection string)');
const jwtSecret = (name) => (judgeService ? z.string().default('unused') : z.string().min(16, `${name} must be at least 16 chars`));

// Fail fast on boot if config is wrong, rather than failing mysteriously
// mid-request once 10L users are hitting the API.
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(5000),

  MONGODB_URI: mongoUri,

  JWT_ACCESS_SECRET: jwtSecret('JWT_ACCESS_SECRET'),
  JWT_REFRESH_SECRET: jwtSecret('JWT_REFRESH_SECRET'),
  JWT_ACCESS_EXPIRY: z.string().default('15m'),
  JWT_REFRESH_EXPIRY: z.string().default('30d'),

  CLIENT_ORIGIN: z.string().default('http://localhost:5173'),

  // Judge0 — public cloud API by default; swap JUDGE0_API_URL to a
  // self-hosted instance later without touching any calling code.
  // JUDGE_MODE:
  //   'remote' = our own isolated judge service (production; see judgeServer.js + server/judge/Dockerfile)
  //   'local'  = run submissions inside this process's machine (development only)
  //   'judge0' = external Judge0 API below.
  JUDGE_MODE: z.enum(['local', 'remote', 'judge0']).default('local'),
  // Production refuses 'local' unless explicitly allowed, because user code would run next to our secrets.
  ALLOW_UNSAFE_LOCAL_JUDGE: z.enum(['true', 'false']).default('false'),
  // remote mode: where the judge service lives and the shared secret both sides use.
  JUDGE_SERVICE_URL: z.string().optional(),
  JUDGE_SERVICE_TOKEN: z.string().optional(),
  // judge service only: run submitted code as this unprivileged user (needs the service to start as root).
  JUDGE_RUN_AS_UID: z.string().optional(),
  JUDGE_RUN_AS_GID: z.string().optional(),
  JUDGE_TIME_LIMIT_MS: z.coerce.number().default(8000), // per test case, wall clock
  JUDGE_MEMORY_MB: z.coerce.number().default(256), // per test case
  JUDGE_CONCURRENCY: z.coerce.number().default(2), // parallel test-case runs
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
  GOOGLE_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),
  LINKEDIN_CLIENT_ID: z.string().optional(),
  LINKEDIN_CLIENT_SECRET: z.string().optional(),
  RAZORPAY_KEY_ID: z.string().optional(),
  RAZORPAY_KEY_SECRET: z.string().optional(),
  RAZORPAY_WEBHOOK_SECRET: z.string().optional(),
  RAZORPAY_PLAN_ID_MONTHLY: z.string().optional(),
  RAZORPAY_PLAN_ID_YEARLY: z.string().optional(),
  FREE_ACCESS_UNTIL: z.string().optional(),

  // Cloudflare Turnstile (bot protection on sign in / sign up / password reset). Optional: when unset, the check is skipped.
  // The matching public site key is VITE_TURNSTILE_SITE_KEY in the client build.
  TURNSTILE_SECRET_KEY: z.string().optional(),

  // Transactional email (forgot password, email verification) via Brevo's HTTP API.
  // Optional: with no key the links are only printed to the server log.
  // MAIL_FROM_EMAIL must be a sender you verified in Brevo.
  BREVO_API_KEY: z.string().optional(),
  MAIL_FROM_EMAIL: z.string().optional(),
  MAIL_FROM_NAME: z.string().default('JeetCode'),
  // Public site URL used in email links. Falls back to RENDER_EXTERNAL_URL (set by Render), then CLIENT_ORIGIN.
  APP_URL: z.string().optional(),
  RENDER_EXTERNAL_URL: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment configuration:');
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;

if (judgeService && (!env.JUDGE_SERVICE_TOKEN || env.JUDGE_SERVICE_TOKEN.length < 32)) {
  console.error('❌ JUDGE_SERVICE_TOKEN (at least 32 characters) is required when JUDGE_SERVICE=true');
  process.exit(1);
}
if (env.JUDGE_MODE === 'remote' && !judgeService && (!env.JUDGE_SERVICE_URL || !env.JUDGE_SERVICE_TOKEN)) {
  console.warn('⚠️  JUDGE_MODE=remote but JUDGE_SERVICE_URL / JUDGE_SERVICE_TOKEN are not set: code execution will fail until they are.');
}
export const isProd = env.NODE_ENV === 'production';
