import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Box, ButtonBase, CircularProgress, IconButton, Typography, useTheme } from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import { problemsApi } from '../../api/problemsApi';
import CompanyAvatar from '../../components/CompanyAvatar';
import { Confetti } from '../aptitude/components/MotionBits';
import { tint } from '../dashboard/dashboardUtils';
import { LibraryFont, libBackBtnSx, libSolidBtnSx, useLibraryPalette } from '../dashboard/components/libraryStyle';

// Phone layout of one company's question roadmap (opened from Companies). Same look as the phone
// dashboard: a banner card in the Contest-banner style (gradient, translucent ring, 28px title), then a
// flat timeline of problems grouped by difficulty. The wide-screen version is CompanyQuestRoadmap.

const TRACKING = '0.03em';
const MAX_PAGES = 5; // 500 questions is plenty for one company path
const STARS = { Easy: 1, Medium: 2, Hard: 3 };
const GROUP_ORDER = ['Easy', 'Medium', 'Hard'];

// Difficulty and lock colours are the ones the dashboard category cards and Aptitude lock tiles use.
const DIFFICULTY = {
  Easy: { color: '#22A06B', bg: '#EAF6EE' },
  Medium: { color: '#F09A2E', bg: '#FFF2E3' },
  Hard: { color: '#EF5B5B', bg: '#FDECEB' },
};
const LOCK = { color: '#F09A2E', bg: '#FFF2E3' };

// Banner gradients from the dashboard (Contest, Prep, Daily, Aptitude, Visualizer, Pro).
// A company always gets the same one, picked from its name. "accent" is the solid colour for the timeline.
const HEROES = [
  { gradient: 'linear-gradient(135deg,#F7A33B,#E8590C)', accent: '#E8590C' },
  { gradient: 'linear-gradient(135deg,#0D9488,#134E4A)', accent: '#0D9488' },
  { gradient: 'linear-gradient(135deg,#7E3FA8,#4A1F8C)', accent: '#7E3FA8' },
  { gradient: 'linear-gradient(135deg,#DB2777,#4C1D95)', accent: '#DB2777' },
  { gradient: 'linear-gradient(135deg,#2563EB,#1E1B4B)', accent: '#2563EB' },
  { gradient: 'linear-gradient(135deg,#F59E0B,#78350F)', accent: '#D97706' },
];
const heroFor = (name) => {
  let h = 0;
  for (const ch of String(name || '')) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return HEROES[h % HEROES.length];
};

// Pulls every question of one company (sorted easy to hard), 100 per request.
async function loadCompanyQuestions(company) {
  const all = [];
  let page = 1;
  let totalPages = 1;
  do {
    // eslint-disable-next-line no-await-in-loop
    const { data } = await problemsApi.list({ company, limit: 100, page, sort: 'difficulty-asc' });
    all.push(...data.data.items);
    totalPages = data.data.pagination?.totalPages || 1;
    page += 1;
  } while (page <= totalPages && page <= MAX_PAGES);
  return all;
}

const plural = (n, word) => `${n.toLocaleString('en-IN')} ${n === 1 ? word : `${word}s`}`;

function Node({ problem, index, current, hero, dark }) {
  const base = { width: 40, height: 40, borderRadius: '50%', flexShrink: 0, display: 'grid', placeItems: 'center', fontSize: 16, fontWeight: 700, lineHeight: 1 };
  if (problem.locked) {
    return (
      <Box aria-hidden sx={{ ...base, bgcolor: dark ? tint(LOCK.color, 16) : LOCK.bg, color: LOCK.color }}>
        <LockRoundedIcon sx={{ fontSize: 20 }} />
      </Box>
    );
  }
  if (problem.solvedByMe) {
    return (
      <Box aria-hidden sx={{ ...base, bgcolor: hero.accent, color: '#fff' }}>
        <CheckRoundedIcon sx={{ fontSize: 22 }} />
      </Box>
    );
  }
  if (current) {
    return (
      <Box aria-hidden sx={{ ...base, background: hero.gradient, color: '#fff', boxShadow: `0 0 0 4px ${tint(hero.accent, 24)}` }}>
        {index + 1}
      </Box>
    );
  }
  const d = DIFFICULTY[problem.difficulty] || DIFFICULTY.Easy;
  return (
    <Box aria-hidden sx={{ ...base, bgcolor: dark ? tint(d.color, 16) : d.bg, color: d.color }}>
      {index + 1}
    </Box>
  );
}

function ProblemRow({ problem, index, current, last, hero, dark, onOpen }) {
  const pal = useLibraryPalette();
  const reduce = useReducedMotion();
  const solved = Boolean(problem.solvedByMe);
  const meta = [problem.difficulty, problem.locked ? 'Pro' : solved ? 'Solved' : problem.acceptanceRate > 0 ? `${problem.acceptanceRate}% accepted` : null].filter(Boolean).join(' · ');
  return (
    <motion.div initial={reduce ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: reduce ? 0 : Math.min(index, 10) * 0.03 }}>
      <ButtonBase
        onClick={onOpen}
        aria-label={`Problem ${index + 1}: ${problem.title}`}
        sx={{ width: '100%', display: 'flex', alignItems: 'stretch', justifyContent: 'flex-start', gap: '12px', textAlign: 'left', fontFamily: 'inherit', color: 'inherit' }}
      >
        <Box sx={{ width: 40, flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Node problem={problem} index={index} current={current} hero={hero} dark={dark} />
          {!last && <Box aria-hidden sx={{ flex: 1, minHeight: 16, width: 0, my: '4px', borderLeft: solved ? `2px solid ${hero.accent}` : `2px dotted ${pal.divider}` }} />}
        </Box>
        <Box sx={{ flex: 1, minWidth: 0, pb: last ? 0 : '16px', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
          <Box sx={{ flex: 1, minWidth: 0, opacity: problem.locked ? 0.8 : 1 }}>
            <Typography sx={{ fontSize: 16, lineHeight: '24px', letterSpacing: TRACKING, fontWeight: current ? 700 : 400, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {problem.title}
            </Typography>
            <Typography noWrap sx={{ fontSize: 14, lineHeight: '20px', letterSpacing: TRACKING, color: pal.muted }}>
              {meta}
            </Typography>
          </Box>
          {current && (
            <Box component="span" sx={{ mt: '2px', height: 24, px: '10px', borderRadius: 999, display: 'inline-flex', alignItems: 'center', fontSize: 13, letterSpacing: TRACKING, fontWeight: 500, bgcolor: tint(hero.accent, 18), color: pal.text, flexShrink: 0 }}>
              Next up
            </Box>
          )}
          <ChevronRightRoundedIcon aria-hidden sx={{ mt: '1px', color: pal.muted, flexShrink: 0 }} />
        </Box>
      </ButtonBase>
    </motion.div>
  );
}

function GroupHeading({ title, solved, total }) {
  const pal = useLibraryPalette();
  return (
    <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 1, mb: 1.5 }}>
      <Typography component="h2" sx={{ fontSize: 18, lineHeight: '24px', fontWeight: 700 }}>{title}</Typography>
      <Typography sx={{ fontSize: 14, lineHeight: '20px', letterSpacing: TRACKING, color: pal.muted, fontVariantNumeric: 'tabular-nums' }}>
        {solved} of {total} solved
      </Typography>
    </Box>
  );
}

export default function MobileCompanyRoadmap({ company, onBack }) {
  const pal = useLibraryPalette();
  const navigate = useNavigate();
  const reduce = useReducedMotion();
  const [items, setItems] = useState(null);
  const [failed, setFailed] = useState(false);
  const [picked, setPicked] = useState(null);
  const currentRef = useRef(null);
  const hero = useMemo(() => heroFor(company.name), [company.name]);
  const dark = useTheme().palette.mode === 'dark';

  useEffect(() => {
    let off = false;
    setItems(null);
    setFailed(false);
    loadCompanyQuestions(company.name)
      .then((list) => !off && setItems(list))
      .catch(() => !off && (setFailed(true), setItems([])));
    return () => { off = true; };
  }, [company.name]);

  const nodes = items || [];
  const solved = nodes.filter((p) => p.solvedByMe).length;
  const pct = nodes.length ? Math.round((solved / nodes.length) * 100) : 0;
  const stars = nodes.reduce((n, p) => n + (p.solvedByMe ? STARS[p.difficulty] || 1 : 0), 0);
  const maxStars = nodes.reduce((n, p) => n + (STARS[p.difficulty] || 1), 0);
  const current = nodes.findIndex((p) => !p.solvedByMe && !p.locked);
  const done = nodes.length > 0 && pct === 100;

  // Groups keep the global problem number, so "Problem 14" means the same thing everywhere.
  const groups = useMemo(() => {
    const byLevel = new Map();
    nodes.forEach((p, i) => {
      const key = GROUP_ORDER.includes(p.difficulty) ? p.difficulty : 'Other';
      if (!byLevel.has(key)) byLevel.set(key, []);
      byLevel.get(key).push({ p, i });
    });
    return [...GROUP_ORDER, 'Other'].filter((k) => byLevel.has(k)).map((k) => ({ title: k, rows: byLevel.get(k) }));
  }, [nodes]);

  // Bring the next problem into view once the list has appeared.
  useEffect(() => {
    if (!items || current < 4) return undefined;
    const t = setTimeout(() => currentRef.current?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' }), 500);
    return () => clearTimeout(t);
  }, [items, current, reduce]);

  const sheet = picked !== null ? nodes[picked] : null;

  return (
    <LibraryFont>
      {done && <Confetti pieces={60} />}

      <IconButton onClick={onBack} aria-label="Back to companies" sx={libBackBtnSx}>
        <ArrowBackRoundedIcon />
      </IconButton>

      {/* Banner card, same construction as the dashboard banners */}
      <Box
        sx={{
          position: 'relative',
          overflow: 'hidden',
          mt: 0.5,
          minHeight: 208,
          borderRadius: '20px',
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          color: '#fff',
          background: `linear-gradient(180deg, rgba(0,0,0,0) 35%, rgba(0,0,0,0.22) 100%), ${hero.gradient}`,
        }}
      >
        <Box
          aria-hidden
          sx={{ position: 'absolute', right: '7%', top: '14%', width: '30%', maxWidth: 120, aspectRatio: '1', borderRadius: '50%', display: 'grid', placeItems: 'center', border: '6px solid rgba(255,255,255,0.55)', background: 'linear-gradient(160deg, rgba(255,255,255,0.25), rgba(255,255,255,0.05))' }}
        >
          <CompanyAvatar name={company.name} logoUrl={company.logoUrl} size={56} />
        </Box>

        <Typography component="h1" sx={{ pr: '36%', fontSize: 28, lineHeight: '33px', fontWeight: 700, letterSpacing: '-0.01em', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {company.name}
        </Typography>
        <Typography sx={{ fontSize: 14, lineHeight: '20px', letterSpacing: TRACKING, opacity: 0.95 }}>
          {items === null ? 'Loading problems' : `${plural(nodes.length, 'problem')} · Easy to Hard`}
        </Typography>

        <Box sx={{ mt: 1.5, display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Box role="progressbar" aria-label={`${company.name} progress`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} sx={{ flex: 1, height: 8, borderRadius: 99, bgcolor: 'rgba(0,0,0,0.25)', overflow: 'hidden' }}>
            <motion.div initial={{ width: reduce ? `${pct}%` : 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, ease: 'easeOut' }} style={{ height: '100%', borderRadius: 99, background: '#fff' }} />
          </Box>
          <Typography sx={{ fontSize: 16, lineHeight: '24px', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{pct}%</Typography>
        </Box>

        <Box sx={{ mt: 1.5, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          <Box sx={{ height: 34, px: '14px', borderRadius: 999, display: 'inline-flex', alignItems: 'center', fontSize: 15, letterSpacing: TRACKING, bgcolor: 'rgba(255,255,255,0.22)', fontVariantNumeric: 'tabular-nums' }}>
            {solved} of {nodes.length} solved
          </Box>
          <Box sx={{ height: 34, px: '12px', gap: 0.5, borderRadius: 999, display: 'inline-flex', alignItems: 'center', fontSize: 15, letterSpacing: TRACKING, bgcolor: 'rgba(255,255,255,0.22)', fontVariantNumeric: 'tabular-nums' }}>
            <StarRoundedIcon aria-hidden sx={{ fontSize: 20, color: '#FFE08A' }} />
            {stars}/{maxStars}
          </Box>
          {company.examSlug && (
            <ButtonBase
              onClick={() => navigate(`/prep/${company.examSlug}`)}
              sx={{ height: 34, pl: '14px', pr: '8px', borderRadius: 999, display: 'inline-flex', alignItems: 'center', fontSize: 15, letterSpacing: TRACKING, fontFamily: 'inherit', color: '#fff', bgcolor: 'rgba(255,255,255,0.22)' }}
            >
              Exam pattern
              <ChevronRightRoundedIcon sx={{ fontSize: 20 }} />
            </ButtonBase>
          )}
        </Box>
      </Box>

      {/* Roadmap */}
      <Box sx={{ mt: 3, pb: 4 }}>
        {items === null ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress size={28} /></Box>
        ) : nodes.length === 0 ? (
          <Typography sx={{ textAlign: 'center', py: 6, fontSize: 16, letterSpacing: TRACKING, color: pal.muted }}>
            {failed ? 'Could not load the problems. Try again in a moment.' : `No ${company.name} problems yet.`}
          </Typography>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {groups.map((g) => (
              <Box key={g.title} component="section">
                <GroupHeading title={g.title} solved={g.rows.filter(({ p }) => p.solvedByMe).length} total={g.rows.length} />
                {g.rows.map(({ p, i }, k) => (
                  <Box key={p._id || p.slug} ref={i === current ? currentRef : undefined}>
                    <ProblemRow problem={p} index={i} current={i === current} last={k === g.rows.length - 1} hero={hero} dark={dark} onOpen={() => setPicked(i)} />
                  </Box>
                ))}
              </Box>
            ))}
            {done && (
              <Typography sx={{ textAlign: 'center', fontSize: 16, lineHeight: '24px', fontWeight: 700 }}>
                All {company.name} problems solved
              </Typography>
            )}
          </Box>
        )}
      </Box>

      {/* Bottom sheet for the tapped problem */}
      <AnimatePresence>
        {sheet && (
          <>
            <motion.div key="backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setPicked(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,.5)', zIndex: 1290 }} />
            <motion.div
              key="sheet"
              role="dialog"
              aria-label={sheet.title}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 30 }}
              style={{ position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 1300, display: 'flex', justifyContent: 'center' }}
            >
              <LibraryFont sx={{ width: '100%', maxWidth: 560, bgcolor: pal.bg, borderRadius: '28px 28px 0 0', px: 2, pt: 1.5, pb: 'calc(20px + env(safe-area-inset-bottom))' }}>
                <Box sx={{ width: 40, height: 4, borderRadius: 4, bgcolor: pal.divider, mx: 'auto', mb: 2 }} />
                <Typography sx={{ fontSize: 20, lineHeight: '28px', fontWeight: 700 }}>{sheet.title}</Typography>
                <Box sx={{ mt: 1, mb: 2.5, display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                  <Box component="span" sx={{ height: 34, px: '14px', borderRadius: 999, display: 'inline-flex', alignItems: 'center', fontSize: 15, letterSpacing: TRACKING, bgcolor: dark ? tint((DIFFICULTY[sheet.difficulty] || DIFFICULTY.Easy).color, 16) : (DIFFICULTY[sheet.difficulty] || DIFFICULTY.Easy).bg, color: (DIFFICULTY[sheet.difficulty] || DIFFICULTY.Easy).color }}>
                    {sheet.difficulty}
                  </Box>
                  {sheet.acceptanceRate > 0 && <Typography sx={{ fontSize: 14, letterSpacing: TRACKING, color: pal.muted }}>{sheet.acceptanceRate}% accepted</Typography>}
                  {sheet.solvedByMe && <Typography sx={{ fontSize: 14, letterSpacing: TRACKING, color: pal.muted }}>Solved</Typography>}
                </Box>
                {sheet.locked ? (
                  <ButtonBase onClick={() => navigate('/pricing')} sx={{ ...libSolidBtnSx, width: '100%', gap: 1, fontFamily: 'inherit' }}>
                    <LockRoundedIcon sx={{ fontSize: 20 }} />
                    Unlock with Pro
                  </ButtonBase>
                ) : (
                  <ButtonBase onClick={() => navigate(`/workspace/${sheet.slug}`)} sx={{ ...libSolidBtnSx, width: '100%', fontFamily: 'inherit', background: hero.gradient }}>
                    {sheet.solvedByMe ? 'Solve again' : 'Solve problem'}
                  </ButtonBase>
                )}
              </LibraryFont>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </LibraryFont>
  );
}

