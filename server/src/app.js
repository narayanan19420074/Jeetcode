import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import morgan from 'morgan';
import routes from './routes/index.js';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js';
import { generalLimiter } from './middlewares/rateLimiter.js';
import { mongoSanitizeSafe } from './middlewares/sanitize.js';
import { env, isProd } from './config/env.js';
import { handleWebhook } from './controllers/billing.controller.js';

export function createApp() {
  const app = express();

  // Behind Render/Railway's reverse proxy — needed for correct client IPs
  // (rate limiting, logging) and secure cookies to work.
  app.set('trust proxy', 1);

  app.use(helmet());
  app.use(
    cors({
      origin: env.CLIENT_ORIGIN,
      credentials: true, // required so the refresh-token cookie is sent
    })
  );
  app.use(compression());

  // Razorpay webhook — MUST be registered before express.json() below.
  // It needs the raw request body to compute the HMAC signature; once
  // express.json() runs, req.body becomes a parsed object and signature
  // verification breaks. Mounted directly here rather than through
  // routes/index.js, since that router only gets attached further down,
  // after express.json() has already consumed the body.
  app.post('/api/billing/webhook', express.raw({ type: 'application/json' }), handleWebhook);

  app.use(express.json({ limit: '256kb' })); // submissions can carry ~20KB of code; 256kb is generous headroom
  app.use(cookieParser());
  app.use(mongoSanitizeSafe); // strips $/. operators from user input to block NoSQL injection, Express-5-safe
  app.use(morgan(isProd ? 'combined' : 'dev'));

  app.use('/api', generalLimiter, routes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
