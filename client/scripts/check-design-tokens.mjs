// Design-token guard. Every visual decision lives in src/app/design/designTokens.js; components use theme values
// or tokens instead of literals.
//
//   Colours (hex, rgb, rgba): hard rule, baseline design-token-baseline.json is empty, any raw colour fails.
//   Values (fontSize, borderRadius, fontFamily, fontWeight): ledger design-value-baseline.json, counts may only
//   go down as pages are migrated (see design-value-rules.mjs).
//
// Usage:
//   node client/scripts/check-design-tokens.mjs            fail if any file has MORE literals than its baseline
//   node client/scripts/check-design-tokens.mjs --update   lower the baselines after a migration (never raises them)
//   node client/scripts/check-design-tokens.mjs --update --allow-raise   only when a new rule is added: records the starting counts
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { VALUE_RULES, countValueViolations } from './design-value-rules.mjs';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const SRC_DIR = path.join(SCRIPT_DIR, '..', 'src');
const BASELINE_FILE = path.join(SCRIPT_DIR, 'design-token-baseline.json');
const VALUE_BASELINE_FILE = path.join(SCRIPT_DIR, 'design-value-baseline.json');
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

const relativeName = (file) => path.relative(SRC_DIR, file).split(path.sep).join('/');

// One pass over the source: raw colour counts and design-value counts per file.
function measureAllFiles() {
  const colours = {};
  const values = {};
  listSourceFiles(SRC_DIR).forEach((file) => {
    const text = fs.readFileSync(file, 'utf8');
    const colourCount = countRawColours(text);
    const valueCounts = countValueViolations(stripComments(text));
    if (colourCount > 0) colours[relativeName(file)] = colourCount;
    if (Object.keys(valueCounts).length) values[relativeName(file)] = valueCounts;
  });
  return { colours, values };
}

const readJson = (file) => (fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : null);
const writeJson = (file, data) => fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
const sumCounts = (counts) => Object.values(counts).reduce((total, value) => total + value, 0);
const sumValueCounts = (values) => Object.values(values).reduce((total, perFile) => total + sumCounts(perFile), 0);

function findRegressions(current, baseline) {
  return Object.entries(current).filter(([file, count]) => count > (baseline[file] ?? 0));
}

function findValueRegressions(current, baseline) {
  return Object.entries(current).flatMap(([file, counts]) =>
    Object.entries(counts)
      .filter(([rule, count]) => count > (baseline[file]?.[rule] ?? 0))
      .map(([rule, count]) => ({ file, rule, count, allowed: baseline[file]?.[rule] ?? 0 }))
  );
}

function reportRegressions(colourRegressions, valueRegressions, baseline) {
  if (colourRegressions.length) {
    console.error('Raw colours found. Use theme values or COLOR_PALETTE tokens from src/app/design/designTokens.js:\n');
    colourRegressions.forEach(([file, count]) => console.error(`  ${file}: ${count} (allowed ${baseline[file] ?? 0})`));
  }
  if (valueRegressions.length) {
    console.error('Hard-coded design values found. Use the theme or tokens from src/app/design/designTokens.js:\n');
    valueRegressions.forEach(({ file, rule, count, allowed }) => console.error(`  ${file}: ${rule} ${count} (allowed ${allowed})`));
    VALUE_RULES.forEach(({ name, fix }) => console.error(`  ${name}: ${fix}`));
  }
  process.exit(1);
}

function main() {
  const { colours, values } = measureAllFiles();
  const colourBaseline = readJson(BASELINE_FILE) ?? {};
  const valueBaseline = readJson(VALUE_BASELINE_FILE);
  const colourRegressions = findRegressions(colours, colourBaseline);
  const valueRegressions = valueBaseline ? findValueRegressions(values, valueBaseline) : [];
  // --allow-raise is only for introducing a new rule: it records today's counts as the starting point.
  const allowRaise = process.argv.includes('--update') && process.argv.includes('--allow-raise');
  if (!allowRaise && (colourRegressions.length || valueRegressions.length)) reportRegressions(colourRegressions, valueRegressions, colourBaseline);
  if (process.argv.includes('--update') || !valueBaseline) {
    writeJson(BASELINE_FILE, colours);
    writeJson(VALUE_BASELINE_FILE, values);
    console.log(`Baselines written: ${sumCounts(colours)} raw colours, ${sumValueCounts(values)} design values in ${Object.keys(values).length} files.`);
    return;
  }
  console.log(`Design tokens OK: ${sumCounts(colours)} raw colours left, ${sumValueCounts(values)} design values (baseline ${sumValueCounts(valueBaseline)}).`);
}

main();
