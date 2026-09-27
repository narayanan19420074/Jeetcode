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
import { mountClient, shouldServeClient } from './serveClient.js';

export function createApp() {
  const app = express();

  // Behind Render/Railway's reverse proxy — needed for correct client IPs
  // (rate limiting, logging) and secure cookies to work.
  app.set('trust proxy', 1);

  // Default CSP blocks Monaco, Google Sign-In, Google Fonts, Razorpay.
  // Skip it only when this service also serves the client.
  app.use(helmet({ contentSecurityPolicy: shouldServeClient() ? false : true }));
  app.use(
    cors({
      origin: env.CLIENT_ORIGIN,
      credentials: true, // required so the refresh-token cookie is sent
    })
  );
  app.use(compression());

  // Razorpay webhook — MUST be registered before express.json() below
  // (needs the raw body for HMAC signature verification).
  app.post('/api/billing/webhook', express.raw({ type: 'application/json' }), handleWebhook);

  app.use(express.json({ limit: '256kb' }));
  app.use(cookieParser());
  app.use(mongoSanitizeSafe);
  app.use(morgan(isProd ? 'combined' : 'dev'));

  app.use('/api', generalLimiter, routes);

  // Serve client/dist in production (does nothing unless SERVE_CLIENT=true)
  mountClient(app);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}