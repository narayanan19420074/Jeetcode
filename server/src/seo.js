import { appUrl } from './services/mail.service.js';

// Search-engine plumbing: robots.txt, sitemap.xml, and the public address that index.html needs for
// share previews (Open Graph). The address comes from APP_URL (or Render's own URL), so changing the
// domain never needs a code change.

const SITE_URL_PLACEHOLDER = '__SITE_URL__';

// Pages anyone can open without signing in.
const PUBLIC_PATHS = ['/', '/problems', '/prep', '/exams', '/plans', '/privacy', '/terms', '/refund', '/help'];

// Signed-in, personal or internal areas: crawlers have no reason to visit them.
const PRIVATE_PATHS = ['/api/', '/admin', '/dashboard', '/settings', '/you', '/room', '/pair', '/mocks', '/auth/'];

const CACHE_CONTROL = 'public, max-age=3600';

export const injectSiteUrl = (html) => html.replaceAll(SITE_URL_PLACEHOLDER, appUrl());

function buildRobotsTxt() {
  const lines = ['User-agent: *', 'Allow: /', ...PRIVATE_PATHS.map((path) => `Disallow: ${path}`), '', `Sitemap: ${appUrl()}/sitemap.xml`, ''];
  return lines.join('\n');
}

function buildSitemapXml() {
  const entries = PUBLIC_PATHS.map((path) => `  <url><loc>${appUrl()}${path}</loc></url>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>\n`;
}

// Must be mounted before the client fallback, which would otherwise answer these URLs with index.html.
export function mountSeoRoutes(app) {
  app.get('/robots.txt', (req, res) => res.set('Cache-Control', CACHE_CONTROL).type('text/plain').send(buildRobotsTxt()));
  app.get('/sitemap.xml', (req, res) => res.set('Cache-Control', CACHE_CONTROL).type('application/xml').send(buildSitemapXml()));
}
