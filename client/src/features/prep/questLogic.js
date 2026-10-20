// Pure helpers for the gamified Prep page. No React in here, so it is easy to reason about.
// Everything is derived from the existing roadmap response: nothing new is needed on the server.

export const FORMS = [
  { kind: 'blip', at: 0, name: 'Blip' },
  { kind: 'zapp', at: 25, name: 'Zapp' },
  { kind: 'ember', at: 50, name: 'Ember' },
  { kind: 'crystalix', at: 70, name: 'Crystalix' },
  { kind: 'nova', at: 90, name: 'Nova' },
];

export const RANKS = ['Rookie', 'Learner', 'Challenger', 'Grinder', 'Contender', 'Specialist', 'Veteran', 'Elite', 'Master', 'Legend'];

export const CLEARED_AT = 70; // a section counts as cleared at 70%, same line the weakness labels use

export const levelFor = (readiness) => Math.min(10, Math.floor(readiness / 10) + 1);
export const formFor = (readiness) => [...FORMS].reverse().find((f) => readiness >= f.at) || FORMS[0];
export const nextFormFor = (readiness) => FORMS.find((f) => f.at > readiness) || null;

export const sectionPct = (s) => (s.trackable ? s.progressPercent || 0 : 0);

export function sectionState(s) {
  const pct = sectionPct(s);
  if (pct >= CLEARED_AT) return 'cleared';
  if (pct > 0) return 'progress';
  return 'fresh';
}

// The quest where the exam weight and the remaining gap are biggest.
export function pickNextQuest(sections) {
  let best = null;
  let bestScore = -1;
  sections.forEach((s) => {
    const pct = sectionPct(s);
    if (pct >= CLEARED_AT) return;
    const score = (s.weight || 0) * (100 - pct);
    if (score > bestScore) {
      best = s;
      bestScore = score;
    }
  });
  return best;
}

// Heaviest section on the exam is the "boss".
export function pickBoss(sections) {
  return sections.reduce((a, s) => (!a || (s.weight || 0) > (a.weight || 0) ? s : a), null);
}

export function buildBadges(roadmap) {
  const r = roadmap.readiness || 0;
  const sections = roadmap.sections || [];
  const firstGroup = sections.length ? sections[0].group : null;
  const partA = sections.filter((s) => s.group === firstGroup);
  const boss = pickBoss(sections);
  return [
    { id: 'first', title: 'First Step', hint: 'Practise anything once', got: sections.some((s) => sectionPct(s) > 0), icon: 'bolt' },
    { id: 'partA', title: firstGroup ? 'Part A Cleared' : 'Warm-up Cleared', hint: 'Clear every section in the first part', got: partA.length > 0 && partA.every((s) => sectionPct(s) >= CLEARED_AT), icon: 'shield' },
    { id: 'half', title: 'Halfway Hero', hint: 'Reach 50 ready', got: r >= 50, icon: 'flag' },
    { id: 'boss', title: 'Boss Slayer', hint: boss ? `Clear ${boss.name}` : 'Clear the boss section', got: boss ? sectionPct(boss) >= CLEARED_AT : false, icon: 'medal' },
    { id: 'ready', title: 'Exam Ready', hint: 'Reach 85 ready', got: r >= 85, icon: 'trophy' },
  ];
}

// Remember the last readiness the student saw, so coming back after practice can celebrate.
const key = (slug) => `jc:prep:seen:${slug}`;
export function loadSeen(slug) {
  try {
    return JSON.parse(localStorage.getItem(key(slug))) || null;
  } catch {
    return null;
  }
}
export function saveSeen(slug, value) {
  try {
    localStorage.setItem(key(slug), JSON.stringify(value));
  } catch {
    /* private mode: celebrations just won't repeat-compare */
  }
}
