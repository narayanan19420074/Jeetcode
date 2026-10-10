// Run from server/:  node scripts/remapChunks.mjs
// Old chunk slugs -> current taxonomy slugs (approximate mapping).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'content', 'aptitude', '_chunks');
const MAP = {
  'time-and-work': {
    'alternate-days': 'alternate-day-work', 'men-days-hours': 'man-days-chain-relations',
    'combined-work': 'basic-time-work', 'comparative-time': 'efficiency-method',
    'work-fraction': 'fraction-of-work-done', 'efficiency-and-ratio': 'efficiency-method',
    'work-and-wages': 'wages-sharing', 'leaving-and-joining': 'leaving-joining-mid-work',
  },
  'profit-and-loss': {
    'find-cost-price': 'reverse-find-cp-from-sp', 'articles-cost-equals-selling': 'basic-cp-sp-profit',
    'markup-then-discount': 'successive-discounts', 'cost-price-selling-price': 'basic-cp-sp-profit',
    'mixed-sale-profit-loss': 'mixed-items-combined-sales', 'equal-selling-price-gain-loss': 'same-selling-price-gain-loss',
  },
  'ratio-and-proportion': {
    'adding-subtracting-to-ratio': 'changing-ratios-add-remove', 'income-expenditure-ratio': 'ratio-of-incomes-expenses',
    'direct-inverse-variation': 'direct-inverse-proportion', 'combining-ratios': 'basic-ratio-simplification',
    'coins-and-money-ratio': 'dividing-a-quantity-in-a-ratio', 'basic-ratio-sharing': 'dividing-a-quantity-in-a-ratio',
    'proportion-fourth-third-mean': 'mean-third-fourth-proportional',
  },
};
for (const [topic, map] of Object.entries(MAP)) {
  const f = path.join(dir, topic, `${topic}.json`);
  const raw = fs.readFileSync(f, 'utf8');
  const d = JSON.parse(raw);
  const qs = Array.isArray(d) ? d : d.questions;
  let n = 0;
  for (const q of qs) if (map[q.subPattern]) { q.subPattern = map[q.subPattern]; n += 1; }
  fs.writeFileSync(f, JSON.stringify(d, null, 2));
  console.log(`${topic}: remapped ${n}/${qs.length}`);
}
