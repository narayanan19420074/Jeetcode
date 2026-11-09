import { StoreItem } from '../../models/StoreItem.js';
import { CATALOG, LOW_STOCK_AT, PHYSICAL_MIN_SOLVED, SHIP_COUNTRY, courseLessonKeys } from '../../config/store.js';

// ---------------------------------------------------------------- catalog

let seeding = null;

// Creates the mutable StoreItem row for any catalog item that has none yet.
// Never touches existing rows, so admin edits survive redeploys.
export function ensureStoreSeeded() {
  if (!seeding) {
    seeding = (async () => {
      const have = new Set((await StoreItem.find({}, 'slug').lean()).map((r) => r.slug));
      const missing = CATALOG.filter((i) => !have.has(i.slug)).map((i) => ({ slug: i.slug, price: i.price, stock: i.stock ?? null, active: true }));
      if (!missing.length) return;
      try {
        await StoreItem.insertMany(missing, { ordered: false });
      } catch (err) {
        // A parallel boot may have inserted the same rows; that is fine.
        if (err?.code !== 11000 && !err?.writeErrors?.length) throw err;
      }
    })().catch((err) => {
      seeding = null;
      throw err;
    });
  }
  return seeding;
}

// slug -> static config merged with the live price / stock / active row.
export async function loadCatalog() {
  await ensureStoreSeeded();
  const rows = await StoreItem.find({}).lean();
  const bySlug = new Map(rows.map((r) => [r.slug, r]));
  const out = new Map();
  for (const cfg of CATALOG) {
    const row = bySlug.get(cfg.slug);
    out.set(cfg.slug, {
      ...cfg,
      price: row?.price ?? cfg.price,
      stock: row ? row.stock ?? null : cfg.stock ?? null,
      active: row ? row.active !== false : true,
      sold: row?.sold ?? 0,
    });
  }
  return out;
}

function courseStats(item) {
  const keys = courseLessonKeys(item);
  const minutes = (item.modules || []).reduce((s, m) => s + m.lessons.reduce((a, l) => a + (l.minutes || 0), 0), 0);
  return { moduleCount: (item.modules || []).length, lessonCount: keys.length, minutes };
}

// What the client sees for one item. `ctx` carries the viewer's own state.
export function publicItem(item, ctx = {}) {
  const limited = item.stock !== null && item.stock !== undefined;
  const base = {
    slug: item.slug,
    name: item.name,
    category: item.category,
    kind: item.kind,
    price: item.price,
    blurb: item.blurb,
    desc: item.desc,
    art: item.art,
    image: item.image || null, // optional real photo URL, set in config/store.js
    accent: item.accent,
    popular: Boolean(item.popular),
    active: item.active,
    limited,
    stockLeft: limited ? item.stock : null,
    soldOut: limited && item.stock <= 0,
    lowStock: limited && item.stock > 0 && item.stock <= LOW_STOCK_AT,
    perUser: item.perUser ?? null,
    purchased: ctx.purchased?.[item.slug] ?? 0,
  };
  if (item.kind === 'pro') base.days = item.days;
  if (item.kind === 'physical') {
    base.sizes = item.sizes || [];
    base.colors = item.colors || [];
    base.minSolved = PHYSICAL_MIN_SOLVED;
    base.shipsTo = SHIP_COUNTRY;
  }
  if (item.kind === 'course') {
    base.level = item.level;
    Object.assign(base, courseStats(item));
    base.owned = Boolean(ctx.owned?.has(item.slug));
  }
  return base;
}
