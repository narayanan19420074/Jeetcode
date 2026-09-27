// Serves the built React app (client/dist) from this same Express service.
//
// Why: on a free-tier deploy this gives ONE service, ONE origin, ONE free
// URL (https://<name>.onrender.com). No CORS, no cross-site cookie issues
// (Safari/iPhone block third-party cookies, which breaks the refresh-token
// login flow when frontend and backend live on different domains), no
// second host to configure.
//
// Off by default. Turn on with SERVE_CLIENT=true (render.yaml does this).
// Local dev is unchanged: Vite still serves the client on :5173.
import fs from 'node:fs';
import path from 'node:path';
import express from 'express';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CLIENT_DIST = path.resolve(__dirname, '../../client/dist');
const INDEX_HTML = path.join(CLIENT_DIST, 'index.html');

export const shouldServeClient = () => process.env.SERVE_CLIENT === 'true';

export function mountClient(app) {
  if (!shouldServeClient()) return;

  if (!fs.existsSync(INDEX_HTML)) {
    console.warn(`SERVE_CLIENT=true but ${INDEX_HTML} not found — did the client build run?`);
    return;
  }

  // Vite fingerprints everything in /assets, so it is safe to cache forever.
  app.use('/assets', express.static(path.join(CLIENT_DIST, 'assets'), { maxAge: '1y', immutable: true }));
  app.use(express.static(CLIENT_DIST, { maxAge: '1h', index: false }));

  // SPA fallback: any non-API GET goes to index.html so React Router can
  // handle deep links like /aptitude/percentage or /admin/login on refresh.
  app.use((req, res, next) => {
    if ((req.method !== 'GET' && req.method !== 'HEAD') || req.path.startsWith('/api')) return next();
    res.set('Cache-Control', 'no-cache');
    res.sendFile(INDEX_HTML);
  });
}
