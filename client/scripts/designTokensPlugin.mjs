import fs from 'node:fs';
import path from 'node:path';
import { MEDIA_QUERIES, OFFLINE_GAME, SPLASH } from '../src/app/design/designTokens.js';
import { staticCssVariables } from '../src/app/design/staticCssVariables.js';

// Plain HTML and CSS cannot import designTokens.js, so they carry %%GROUP.key%% placeholders and this plugin
// fills them from the tokens at build time. A misspelled placeholder fails the build instead of shipping broken CSS.
const TOKEN_GROUPS = { SPLASH, OFFLINE: OFFLINE_GAME, MEDIA: MEDIA_QUERIES };
const PLACEHOLDER = /%%([A-Za-z]+(?:\.[A-Za-z0-9]+)+)%%/g;

function lookupToken(tokenPath) {
  const [group, ...keys] = tokenPath.split('.');
  return keys.reduce((value, key) => value?.[key], TOKEN_GROUPS[group]);
}

export function fillTokenPlaceholders(text, fileName) {
  return text.replace(PLACEHOLDER, (placeholder, tokenPath) => {
    const value = lookupToken(tokenPath);
    if (typeof value !== 'string') throw new Error(`Unknown design token ${placeholder} in ${fileName}`);
    return value;
  });
}

// The offline game is served as a static file by the service worker, so it is generated into public/ before Vite
// copies that folder. The generated file is not committed (see .gitignore).
function writeOfflinePage(projectRoot) {
  const template = fs.readFileSync(path.join(projectRoot, 'static-pages', 'offline.template.html'), 'utf8');
  fs.writeFileSync(path.join(projectRoot, 'public', 'offline.html'), fillTokenPlaceholders(template, 'offline.template.html'));
}

const isAppStylesheet = (id) => id.split('?')[0].endsWith(`${path.sep}src${path.sep}index.css`) || id.split('?')[0].endsWith('/src/index.css');

export function designTokensPlugin() {
  return {
    name: 'jeetcode-design-tokens',
    enforce: 'pre',
    configResolved: (config) => writeOfflinePage(config.root),
    transformIndexHtml: {
      order: 'pre',
      handler: (html) => fillTokenPlaceholders(html, 'index.html').replace('</head>', `<style>${staticCssVariables()}</style></head>`),
    },
    transform: (code, id) => (isAppStylesheet(id) ? { code: fillTokenPlaceholders(code, 'index.css'), map: null } : null),
  };
}
