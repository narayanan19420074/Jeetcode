// Design-token guard: components must not contain raw colour literals (hex, rgb, rgba).
// Colours live in src/app/design/designTokens.js; components use theme values or PALETTE references.
//
// Usage:
//   node client/scripts/check-design-tokens.mjs            fail if any file has MORE raw colours than the baseline
//   node client/scripts/check-design-tokens.mjs --update   rewrite the baseline (only after removing colours)
//
// The baseline (design-token-baseline.json) is the migration ledger: counts may only go down. When it is empty
// the check is a hard rule and any raw colour fails the build.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const SRC_DIR = path.join(SCRIPT_DIR, '..', 'src');
const BASELINE_FILE = path.join(SCRIPT_DIR, 'design-token-baseline.json');
const TOKEN_DIR = `${path.sep}app${path.sep}design${path.sep}`;
const COLOR_PATTERN = /rgba?\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*(?:,\s*\d*\.?\d+\s*)?\)|#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3})(?![0-9a-zA-Z_-])/g;

const isSourceFile = (name) => /\.(js|jsx)$/.test(name);

function listSourceFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return listSourceFiles(full);
    return isSourceFile(entry.name) && !full.includes(TOKEN_DIR) ? [full] : [];
  });
}

// Comments may mention colours when explaining a design decision; only code is checked.
const stripComments = (text) => text.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|\s)\/\/.*$/gm, '$1');

// Same exclusions as the migration tool: url(#gradient-id) and HTML entities (&#123;) are not colours.
function countRawColours(text) {
  return [...stripComments(text).matchAll(COLOR_PATTERN)].filter((match) => {
    const before = text.slice(Math.max(0, match.index - 4), match.index);
    return !/url\($/.test(before) && !/&$/.test(before);
  }).length;
}

function measureAllFiles() {
  const counts = {};
  listSourceFiles(SRC_DIR).forEach((file) => {
    const count = countRawColours(fs.readFileSync(file, 'utf8'));
    if (count > 0) counts[path.relative(SRC_DIR, file).split(path.sep).join('/')] = count;
  });
  return counts;
}

const readBaseline = () => (fs.existsSync(BASELINE_FILE) ? JSON.parse(fs.readFileSync(BASELINE_FILE, 'utf8')) : {});
const sumCounts = (counts) => Object.values(counts).reduce((total, value) => total + value, 0);

function findRegressions(current, baseline) {
  return Object.entries(current).filter(([file, count]) => count > (baseline[file] ?? 0));
}

function reportRegressions(regressions, baseline) {
  console.error('Raw colours found. Use theme values or PALETTE tokens from src/app/design/designTokens.js:\n');
  regressions.forEach(([file, count]) => console.error(`  ${file}: ${count} (allowed ${baseline[file] ?? 0})`));
  process.exit(1);
}

function main() {
  const current = measureAllFiles();
  if (process.argv.includes('--update')) {
    fs.writeFileSync(BASELINE_FILE, `${JSON.stringify(current, null, 2)}\n`);
    console.log(`Baseline updated: ${sumCounts(current)} raw colours in ${Object.keys(current).length} files.`);
    return;
  }
  const baseline = readBaseline();
  const regressions = findRegressions(current, baseline);
  if (regressions.length) reportRegressions(regressions, baseline);
  console.log(`Design tokens OK: ${sumCounts(current)} raw colours left (baseline ${sumCounts(baseline)}).`);
}

main();
