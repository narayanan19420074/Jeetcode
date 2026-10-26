import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Container,
  Grid,
  IconButton,
  Link,
  Stack,
  Tab,
  Tabs,
  Tooltip,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import PhoneIphoneRoundedIcon from '@mui/icons-material/PhoneIphoneRounded';
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded';
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded';
import WorkspacePremiumRoundedIcon from '@mui/icons-material/WorkspacePremiumRounded';
import { AnimatePresence, MotionConfig, animate, motion, useInView } from 'framer-motion';

import { apiClient } from '../../api/apiClient';
import { toggleThemeMode } from '../../app/uiSlice';
import CompanyAvatar from '../../components/CompanyAvatar';
import { useContest, inr, fmtDuration } from '../contest/contestUtils';
import ContestBand from './ContestBand';
import HeroDemo from './art/HeroDemo';
import OfferLetter from './art/OfferLetter';
import { ArenaVisual, CompanyVisual, HeatVisual, LabVisual, PlanVisual, RoomVisual, SortVisual, TierVisual } from './art/FeatureVisuals';
import { DISPLAY_FONT, drift, marqueeLeft, marqueeRight } from './anim';

// --- Copy rules for this page -------------------------------------------
// Page structure follows the proven landing-page flow: outcome hero -> one
// CTA -> proof -> "is it for me?" -> how it works -> before/after -> features
// -> pricing with risk reversal -> FAQ -> final CTA + sticky CTA.
// Hooks may be strong; claims may not be false. Every number below comes
// from the content in this repo (problem bank, aptitude bank, tier table,
// pricing page, contest config). Update them when the product grows, never
// round up. No invented testimonials, no invented refund guarantee, no
// invented time-saved numbers. One label per intent: START = create an account.
// Style: short punchy headlines, one line per card, real app screenshots.
// Screenshots live in client/public/screens/*.png. If one is missing the page
// falls back to the in-code illustration, so nothing ever shows a broken image.
const START = 'Start free';

const STATS = [
  { target: 290, suffix: '+', label: 'coding problems' },
  { target: 3200, suffix: '', label: 'aptitude questions' },
  { target: 32, suffix: '', label: 'aptitude patterns' },
  { target: 15, suffix: '', label: 'algorithm visualizations' },
];

const TAGGED_COMPANIES = [
  'Amazon', 'Google', 'Meta', 'Microsoft', 'Apple', 'Bloomberg', 'LinkedIn', 'Uber', 'Adobe', 'Airbnb',
  'Dropbox', 'Pinterest', 'PayPal', 'Oracle', 'Goldman Sachs',
];

// "Is it for me?" - one tab per kind of visitor.
const PERSONAS = [
  {
    key: 'final',
    label: 'Final years',
    title: 'Placement season is close.',
    body: 'Coding, aptitude and company prep. One place.',
    points: ['290+ problems, Easy to Hard', 'Company tags from Amazon, Google, Meta', 'Streaks and a leaderboard'],
    cta: 'Open the problem list',
    path: '/problems',
    visual: 'arena',
    shot: '/screens/problems.png',
  },
  {
    key: 'nqt',
    label: 'TCS NQT',
    title: 'Prep for the exam you will sit.',
    body: 'Real sections. Real timings. A live readiness score.',
    points: ['Roadmap from the real exam pattern', 'Exam-style tests with a timer', 'Readiness score for every section'],
    cta: 'Browse company prep',
    path: '/prep',
    visual: 'company',
    shot: '/screens/prep.png',
  },
  {
    key: 'aptitude',
    label: 'Aptitude',
    title: 'Weak at aptitude? Learn it, then beat the clock.',
    body: '32 patterns. Animated lessons first, graded practice next.',
    points: ['3,200 questions', 'Lessons that play the problem first', 'Pass the test, unlock the next pattern'],
    cta: 'Explore aptitude patterns',
    path: '/aptitude',
    visual: 'lab',
    shot: '/screens/aptitude.png',
  },
  {
    key: 'pair',
    label: 'With a friend',
    title: 'Practice is easier with a friend.',
    body: 'Share a link. Code together. No signup for your friend.',
    points: ['One shared editor', 'Chat, voice and video', 'Coding and aptitude questions'],
    cta: 'Start a pair room',
    path: '/pair',
    visual: 'room',
    shot: '/screens/pair.png',
  },
];

const VISUALS = { arena: ArenaVisual, company: CompanyVisual, lab: LabVisual, room: RoomVisual };

const STEPS = [
  { title: 'Pick your target', body: 'A company track or an Easy problem.', shot: '/screens/dashboard.png', alt: 'JeetCode dashboard' },
  { title: 'Learn it. Then test it.', body: 'Animated lessons. Timed practice.', shot: '/screens/aptitude.png', alt: 'JeetCode aptitude lesson' },
  { title: 'Track it. Share it.', body: 'Streaks, scores and pair rooms.', shot: '/screens/pair.png', alt: 'JeetCode pair room' },
];

const BEFORE_TOOLS = [
  'Problem site · tab 1', 'Aptitude PDF · 200 pages', 'WhatsApp group · "who did what?"', 'Spreadsheet · streaks',
];
const AFTER_ITEMS = ['Coding problems', 'Aptitude patterns', 'Company roadmap', 'Streaks and pair rooms'];

const PRO_FEATURES = [
  'Every company-tagged coding problem',
  'Unlimited AI hints',
  'The full TCS NQT aptitude test suite',
  'Priority code judging at peak hours',
];
const FREE_FEATURES = [
  'Coding problems without company tags',
  'Aptitude patterns with animated lessons',
  'Dashboard, streaks and the leaderboard',
  'Pair rooms and the algorithm visualizer',
];
// Same prices as the Pricing page. Keep in sync.
const PRICE_MONTH = 149;
const PRICE_YEAR = 1199;

// ---------------------------------------------------------------------------
function useLaunchOffer() {
  const [until, setUntil] = useState(null);
  useEffect(() => {
    let off = false;
    apiClient
      .get('/health')
      .then((res) => {
        const d = res.data?.freeAccessUntil ? new Date(res.data.freeAccessUntil) : null;
        if (!off && d && d > new Date()) setUntil(d);
      })
      .catch(() => {});
    return () => { off = true; };
  }, []);
  return until ? until.toLocaleDateString('en-IN', { day: 'numeric', month: 'long' }) : null;
}

// ---------------------------------------------------------------------------

function Eyebrow({ children, align = 'left' }) {
  return (
    <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center', justifyContent: align === 'center' ? 'center' : 'flex-start', mb: 2 }}>
      {align !== 'center' && <Box sx={{ width: 28, height: 2, bgcolor: 'primary.main', borderRadius: 1 }} />}
      <Typography sx={{ fontWeight: 800, fontSize: '0.78rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'primary.main' }}>
        {children}
      </Typography>
    </Stack>
  );
}

function SectionHeading({ children, eyebrow, sub, align = 'left', maxWidth = 640, light = false, sx }) {
  return (
    <Box sx={{ textAlign: align, maxWidth, mx: align === 'center' ? 'auto' : 0, mb: { xs: 4, md: 6 }, ...sx }}>
      {eyebrow && <Eyebrow align={align}>{eyebrow}</Eyebrow>}
      <Typography
        variant="h2"
        sx={{
          fontFamily: DISPLAY_FONT,
          fontWeight: 800,
          fontSize: { xs: '2rem', md: '2.75rem' },
          lineHeight: 1.08,
          letterSpacing: '-0.03em',
          textWrap: 'balance',
          color: light ? '#fff' : 'text.primary',
        }}
      >
        {children}
      </Typography>
      {sub && (
        <Typography sx={{ mt: 1.75, fontSize: '1.08rem', lineHeight: 1.6, maxWidth: '58ch', mx: align === 'center' ? 'auto' : 0, color: light ? alpha('#fff', 0.8) : 'text.secondary' }}>
          {sub}
        </Typography>
      )}
    </Box>
  );
}

function PrimaryCta({ onClick, label, size = 'large', sx, buttonRef, light = false }) {
  return (
    <Button
      ref={buttonRef}
      size={size}
      variant="contained"
      disableElevation
      onClick={onClick}
      sx={{
        fontWeight: 800,
        px: 3.5,
        py: 1.3,
        whiteSpace: 'nowrap',
        transition: 'transform 0.18s ease, box-shadow 0.18s ease',
        '&:hover': { transform: 'translateY(-2px)', boxShadow: (t) => `0 12px 24px -10px ${alpha(t.palette.primary.main, 0.7)}` },
        '&:active': { transform: 'translateY(0) scale(0.98)' },
        ...(light && { bgcolor: '#fff', color: '#1E1B4B', '&:hover': { bgcolor: '#fff', transform: 'translateY(-2px)' } }),
        ...sx,
      }}
    >
      {label}
    </Button>
  );
}

// Real app screenshot in a phone frame. Missing file -> fallback (or nothing).
function Shot({ src, alt, fallback = null, maxWidth = 280, crop, priority = false, sx }) {
  const [failed, setFailed] = useState(false);
  if (failed) return fallback;
  return (
    <Box
      sx={{
        position: 'relative',
        mx: 'auto',
        width: '100%',
        maxWidth,
        p: '6px',
        borderRadius: '30px',
        bgcolor: '#0F172A',
        boxShadow: (t) => `0 32px 60px -30px ${alpha(t.palette.primary.main, 0.6)}, 0 0 0 1px ${alpha('#fff', 0.1)} inset`,
        ...(crop && { height: crop, overflow: 'hidden' }),
        ...sx,
      }}
    >
      <Box
        component="img"
        src={src}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        onError={() => setFailed(true)}
        sx={{
          display: 'block',
          width: '100%',
          borderRadius: '24px',
          objectFit: 'cover',
          objectPosition: 'top',
          ...(crop ? { height: '100%' } : { aspectRatio: '9 / 19.5' }),
        }}
      />
    </Box>
  );
}

function NavBar({ authed, onStart, onLogin }) {
  const dispatch = useDispatch();
  const mode = useSelector((s) => s.ui.mode);
  const links = [['Is it for me?', '#for-me'], ['How it works', '#how-it-works'], ['Features', '#features'], ['Pricing', '#pricing']];
  return (
    <Box
      component="header"
      sx={{
        position: 'sticky',
        top: 0,
        zIndex: 20,
        borderBottom: '1px solid',
        borderColor: 'divider',
        bgcolor: (t) => alpha(t.palette.background.default, 0.82),
        backdropFilter: 'blur(12px)',
      }}
    >
      <Container maxWidth="lg">
        <Stack direction="row" sx={{ height: 64, alignItems: 'center', justifyContent: 'space-between' }}>
          <Stack direction="row" spacing={4} sx={{ alignItems: 'center' }}>
            <Typography component="a" href="#top" sx={{ fontFamily: DISPLAY_FONT, fontWeight: 800, fontSize: '1.35rem', color: 'text.primary', textDecoration: 'none', letterSpacing: '-0.02em' }}>
              Jeet<Box component="span" sx={{ color: 'primary.main' }}>Code</Box>
            </Typography>
            <Stack direction="row" spacing={3} sx={{ display: { xs: 'none', md: 'flex' } }}>
              {links.map(([l, h]) => (
                <Link key={l} href={h} underline="none" color="text.secondary" sx={{ fontWeight: 600, fontSize: '0.92rem', '&:hover': { color: 'text.primary' } }}>
                  {l}
                </Link>
              ))}
            </Stack>
          </Stack>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Tooltip title={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
              <IconButton onClick={() => dispatch(toggleThemeMode())} color="inherit" aria-label="Toggle color theme">
                {mode === 'dark' ? <LightModeRoundedIcon /> : <DarkModeRoundedIcon />}
              </IconButton>
            </Tooltip>
            {!authed && (
              <Button color="inherit" onClick={onLogin} sx={{ fontWeight: 700 }}>
                Log in
              </Button>
            )}
            <PrimaryCta size="medium" label={authed ? 'Open dashboard' : START} onClick={onStart} sx={{ px: 2.5, py: 0.7 }} />
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}

function StatItem({ target, suffix, label }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!inView) return undefined;
    const controls = animate(0, target, { duration: 1.4, ease: 'easeOut', onUpdate: (v) => setValue(Math.round(v)) });
    return () => controls.stop();
  }, [inView, target]);
  return (
    <Box ref={ref}>
      <Typography sx={{ fontFamily: DISPLAY_FONT, fontWeight: 800, fontSize: { xs: '2.3rem', md: '3rem' }, lineHeight: 1, letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums' }}>
        {value.toLocaleString('en-IN')}
        {suffix}
      </Typography>
      <Typography color="text.secondary" sx={{ mt: 0.75, fontWeight: 600, fontSize: '0.95rem' }}>
        {label}
      </Typography>
    </Box>
  );
}

function CompanyRow({ items, direction, duration }) {
  const tiled = [...items, ...items, ...items, ...items];
  return (
    <Box sx={{ display: 'flex', width: 'max-content', gap: 4.5, animation: `${direction === 'left' ? marqueeLeft : marqueeRight} ${duration}s linear infinite`, '&:hover': { animationPlayState: 'paused' } }}>
      {tiled.map((name, i) => (
        <Stack key={`${name}-${i}`} direction="row" spacing={1.1} sx={{ alignItems: 'center', whiteSpace: 'nowrap' }}>
          <CompanyAvatar name={name === 'Meta' ? 'Facebook' : name} size={32} />
          <Typography sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.95rem' }}>{name}</Typography>
        </Stack>
      ))}
    </Box>
  );
}

function ProofBand() {
  const half = Math.ceil(TAGGED_COMPANIES.length / 2);
  const mask = 'linear-gradient(90deg, transparent, black 8%, black 92%, transparent)';
  return (
    <Box sx={{ borderTop: '1px solid', borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
      <Container maxWidth="lg" sx={{ pt: { xs: 5, md: 6 }, pb: { xs: 4, md: 5 } }}>
        <Typography sx={{ textAlign: 'center', fontFamily: DISPLAY_FONT, fontWeight: 800, fontSize: { xs: '1.4rem', md: '1.8rem' }, letterSpacing: '-0.02em', mb: { xs: 3.5, md: 4.5 } }}>
          Real numbers. Zero fluff.
        </Typography>
        <Grid container spacing={{ xs: 3.5, md: 3 }}>
          {STATS.map((s) => (
            <Grid key={s.label} size={{ xs: 6, md: 3 }}>
              <StatItem {...s} />
            </Grid>
          ))}
        </Grid>
        <Typography color="text.secondary" sx={{ mt: { xs: 5, md: 6 }, mb: 2, fontWeight: 600, fontSize: '0.92rem' }}>
          Coding problems tagged from the interviews of
        </Typography>
        <Stack spacing={1.75}>
          {[{ items: TAGGED_COMPANIES.slice(0, half), direction: 'left', duration: 38 }, { items: TAGGED_COMPANIES.slice(half), direction: 'right', duration: 42 }].map((row, i) => (
            <Box key={i} sx={{ overflow: 'hidden', maskImage: mask, WebkitMaskImage: mask }}>
              <CompanyRow {...row} />
            </Box>
          ))}
        </Stack>
      </Container>
    </Box>
  );
}

// "Is it for me?" - tabs by visitor type, each with copy + a working mini-product.
function PersonaTabs({ onGo }) {
  const [key, setKey] = useState(PERSONAS[0].key);
  const p = PERSONAS.find((x) => x.key === key) || PERSONAS[0];
  const Visual = VISUALS[p.visual];
  return (
    <Box>
      <Tabs
        value={key}
        onChange={(_, v) => setKey(v)}
        variant="scrollable"
        scrollButtons={false}
        sx={{
          mb: { xs: 3, md: 4 },
          p: 0.75,
          minHeight: 0,
          width: 'fit-content',
          maxWidth: '100%',
          mx: 'auto',
          borderRadius: 99,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          '& .MuiTabs-indicator': { display: 'none' },
          '& .MuiTab-root': { minHeight: 0, py: 1.1, px: 2.5, borderRadius: 99, textTransform: 'none', fontWeight: 700, fontSize: '0.95rem', color: 'text.secondary' },
          '& .Mui-selected': { bgcolor: (t) => alpha(t.palette.primary.main, 0.12), color: 'primary.main' },
        }}
      >
        {PERSONAS.map((x) => (
          <Tab key={x.key} value={x.key} label={x.label} disableRipple />
        ))}
      </Tabs>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1.1fr 1fr' }, gap: { xs: 4, md: 8 }, alignItems: 'center' }}>
        <Box>
          <Typography variant="h3" sx={{ fontFamily: DISPLAY_FONT, fontWeight: 800, fontSize: { xs: '1.7rem', md: '2.2rem' }, lineHeight: 1.1, letterSpacing: '-0.025em', textWrap: 'balance', mb: 1.75 }}>
            {p.title}
          </Typography>
          <Typography color="text.secondary" sx={{ fontSize: '1.06rem', lineHeight: 1.62, mb: 2.5, maxWidth: '52ch' }}>{p.body}</Typography>
          <Stack spacing={1.1} sx={{ mb: 3.5 }}>
            {p.points.map((pt) => (
              <Stack key={pt} direction="row" spacing={1.25} sx={{ alignItems: 'flex-start' }}>
                <CheckRoundedIcon sx={{ fontSize: 20, color: 'success.main', mt: '2px' }} />
                <Typography sx={{ fontWeight: 600, lineHeight: 1.5 }}>{pt}</Typography>
              </Stack>
            ))}
          </Stack>
          <Button variant="outlined" size="large" onClick={onGo(p.path)} sx={{ fontWeight: 700, px: 3, py: 1.1, borderWidth: 1.5, '&:hover': { borderWidth: 1.5 } }}>
            {p.cta}
          </Button>
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Shot key={p.key} src={p.shot} alt={`${p.label} screen in JeetCode`} maxWidth={260} fallback={<Visual />} />
        </Box>
      </Box>
    </Box>
  );
}

// 01-03 cards, each with a real screenshot underneath.
function StepCards({ steps }) {
  return (
    <Grid container spacing={{ xs: 3, md: 3 }}>
      {steps.map((st, i) => (
        <Grid key={st.title} size={{ xs: 12, md: 4 }}>
          <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: '20px', border: '1px solid', borderColor: 'divider', bgcolor: 'background.default', p: { xs: 2.5, md: 3 }, overflow: 'hidden' }}>
            <Box sx={{ width: 40, height: 40, mb: 2, borderRadius: '12px', display: 'grid', placeItems: 'center', bgcolor: (t) => alpha(t.palette.primary.main, 0.12), color: 'primary.main', fontFamily: DISPLAY_FONT, fontWeight: 800 }}>
              {String(i + 1).padStart(2, '0')}
            </Box>
            <Typography sx={{ fontFamily: DISPLAY_FONT, fontWeight: 800, fontSize: '1.35rem', letterSpacing: '-0.02em' }}>{st.title}</Typography>
            <Typography color="text.secondary" sx={{ mt: 0.5, mb: 3, lineHeight: 1.5 }}>{st.body}</Typography>
            <Box sx={{ mt: 'auto', mx: { xs: 2, md: 1 }, mb: { xs: -9, md: -10 } }}>
              <Shot src={st.shot} alt={st.alt} crop={300} maxWidth={230} />
            </Box>
          </Box>
        </Grid>
      ))}
    </Grid>
  );
}

// Before / after: scattered prep vs one place. No invented hour counts.
function BeforeAfter() {
  return (
    <Grid container spacing={{ xs: 3, md: 4 }}>
      <Grid size={{ xs: 12, md: 6 }}>
        <Box sx={{ height: '100%', borderRadius: '20px', border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', p: { xs: 2.5, md: 3.5 } }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 2.5 }}>
            <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: 'error.main' }} />
            <Typography sx={{ fontWeight: 800, letterSpacing: '0.14em', fontSize: '0.8rem', color: 'text.secondary' }}>BEFORE</Typography>
          </Stack>
          <Stack spacing={1.25}>
            {BEFORE_TOOLS.map((t, i) => (
              <Stack key={t} direction="row" spacing={1.25} sx={{ alignItems: 'center', px: 1.75, py: 1.1, borderRadius: '12px', bgcolor: 'background.default', border: '1px solid', borderColor: 'divider', transform: `rotate(${i % 2 === 0 ? -0.8 : 0.8}deg)` }}>
                <CloseRoundedIcon sx={{ fontSize: 18, color: 'error.main' }} />
                <Typography sx={{ fontWeight: 600, fontSize: '0.95rem' }}>{t}</Typography>
              </Stack>
            ))}
          </Stack>
          <Typography sx={{ mt: 3, fontFamily: DISPLAY_FONT, fontWeight: 800, fontSize: { xs: '1.6rem', md: '2rem' }, letterSpacing: '-0.02em', color: 'error.main' }}>
            4 places. No clear next step.
          </Typography>
        </Box>
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <Box sx={{ height: '100%', borderRadius: '20px', border: '1.5px solid', borderColor: 'primary.main', bgcolor: (t) => alpha(t.palette.primary.main, 0.06), p: { xs: 2.5, md: 3.5 } }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 2.5 }}>
            <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: 'primary.main' }} />
            <Typography sx={{ fontWeight: 800, letterSpacing: '0.14em', fontSize: '0.8rem', color: 'primary.main' }}>WITH JEETCODE</Typography>
          </Stack>
          <Stack spacing={1.25}>
            {AFTER_ITEMS.map((t) => (
              <Stack key={t} direction="row" spacing={1.25} sx={{ alignItems: 'center', px: 1.75, py: 1.1, borderRadius: '12px', bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
                <CheckCircleRoundedIcon sx={{ fontSize: 18, color: 'success.main' }} />
                <Typography sx={{ fontWeight: 600, fontSize: '0.95rem' }}>{t}</Typography>
              </Stack>
            ))}
          </Stack>
          <Typography sx={{ mt: 3, fontFamily: DISPLAY_FONT, fontWeight: 800, fontSize: { xs: '1.6rem', md: '2rem' }, letterSpacing: '-0.02em', color: 'primary.main' }}>
            1 dashboard. Clear next step.
          </Typography>
        </Box>
      </Grid>
    </Grid>
  );
}

function MiniCard({ title, body, children, sx, action }) {
  return (
    <Box sx={{ borderRadius: '18px', border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', p: { xs: 2.5, md: 3 }, height: '100%', display: 'flex', flexDirection: 'column', gap: 2, ...sx }}>
      <Box>
        <Typography sx={{ fontFamily: DISPLAY_FONT, fontWeight: 800, fontSize: '1.3rem', letterSpacing: '-0.015em', mb: 0.6 }}>{title}</Typography>
        <Typography color="text.secondary" sx={{ lineHeight: 1.55, maxWidth: '46ch' }}>{body}</Typography>
      </Box>
      <Box sx={{ mt: 'auto' }}>{children}</Box>
      {action}
    </Box>
  );
}

function PlanCard({ name, price, note, points, cta, onCta, primary = false, badge, footnote }) {
  return (
    <Box
      sx={{
        position: 'relative',
        borderRadius: '18px',
        p: { xs: 3, md: 4 },
        border: '1.5px solid',
        borderColor: primary ? 'primary.main' : 'divider',
        bgcolor: (t) => (primary ? alpha(t.palette.primary.main, 0.07) : 'background.paper'),
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      {badge && (
        <Box sx={{ position: 'absolute', top: -13, left: 24, px: 1.5, py: 0.3, borderRadius: 99, bgcolor: 'warning.main', color: '#fff', fontWeight: 800, fontSize: '0.78rem' }}>
          {badge}
        </Box>
      )}
      <Typography sx={{ fontFamily: DISPLAY_FONT, fontWeight: 800, fontSize: '1.4rem' }}>{name}</Typography>
      <Typography sx={{ fontFamily: DISPLAY_FONT, fontWeight: 800, fontSize: '2.6rem', letterSpacing: '-0.03em', mt: 1, lineHeight: 1.1 }}>{price}</Typography>
      <Typography color="text.secondary" sx={{ mb: 2.5, mt: 0.5, fontSize: '0.95rem' }}>{note}</Typography>
      <Stack spacing={1.2} sx={{ mb: 3.5 }}>
        {points.map((p) => (
          <Stack key={p} direction="row" spacing={1.25}>
            <CheckCircleRoundedIcon sx={{ fontSize: 20, color: primary ? 'primary.main' : 'success.main', mt: '1px' }} />
            <Typography sx={{ fontWeight: 600 }}>{p}</Typography>
          </Stack>
        ))}
      </Stack>
      <Box sx={{ mt: 'auto' }}>
        <Button fullWidth size="large" variant={primary ? 'contained' : 'outlined'} disableElevation onClick={onCta} sx={{ fontWeight: 800, py: 1.25, ...(!primary && { borderWidth: 1.5, '&:hover': { borderWidth: 1.5 } }) }}>
          {cta}
        </Button>
        {footnote && (
          <Typography color="text.secondary" sx={{ mt: 1.5, textAlign: 'center', fontSize: '0.85rem' }}>{footnote}</Typography>
        )}
      </Box>
    </Box>
  );
}

const FooterCol = ({ title, links }) => (
  <Box>
    <Typography sx={{ fontWeight: 800, mb: 1.5, fontSize: '0.95rem' }}>{title}</Typography>
    <Stack spacing={1}>
      {links.map(([label, onClick]) => (
        <Link key={label} component="button" type="button" onClick={onClick} underline="hover" color="text.secondary" sx={{ textAlign: 'left', font: 'inherit', fontSize: '0.92rem' }}>
          {label}
        </Link>
      ))}
    </Stack>
  </Box>
);

export default function HomePage() {
  const navigate = useNavigate();
  const authed = useSelector((s) => s.auth.isAuthenticated);
  const offerEnds = useLaunchOffer();
  const { contest } = useContest();

  const go = (path) => () => navigate(path);
  const goStart = () => navigate(authed ? '/dashboard' : '/signup');
  const startLabel = authed ? 'Open dashboard' : START;

  // Mobile sticky CTA: only while neither the hero CTA nor the final CTA is visible.
  const heroCtaRef = useRef(null);
  const finalCtaRef = useRef(null);
  const heroCtaVisible = useInView(heroCtaRef);
  const finalCtaVisible = useInView(finalCtaRef);
  const showSticky = !heroCtaVisible && !finalCtaVisible;

  const faq = [
    {
      q: 'Is JeetCode really free?',
      a: 'Yes. Create an account without a card and start practicing straight away. A few things, like company-tagged problems and unlimited AI hints, are part of JeetCode Pro, which you can add whenever you want.',
    },
    {
      q: 'How is it different from just using a coding site and a PDF?',
      a: 'Coding, aptitude and company prep sit on one dashboard, so you always see what is covered and what is left. Add readiness scores, streaks and pair rooms, and you stop guessing what to do next.',
    },
    {
      q: 'Which languages can I code in?',
      a: 'JavaScript, Python and C++. Every submission runs against test cases and comes back with a verdict.',
    },
    {
      q: 'Can I practice with a friend?',
      a: 'Yes. Create a pair room, send the link, and you both get one shared editor with chat, voice and video. A room holds two people, and your friend can join as a guest. You can run aptitude questions together too.',
    },
    {
      q: 'Is the aptitude section only for TCS NQT?',
      a: 'The TCS NQT track is live, with its real exam sections and a readiness score. The 32 patterns (percentages, time and work, ratios, probability and more) are just as useful for other company aptitude rounds.',
    },
    {
      q: 'Tell me about the contest.',
      a: contest && contest.status !== 'ended'
        ? `The ${contest.title} has ${contest.problemCount} ${contest.difficulty.toLowerCase()} problems, ${fmtDuration(contest.durationMinutes)} on the clock and a ${inr(contest.prizePool)} prize pool. AI tools are banned for the whole contest. Apply on the contest page and read the rules before you do.`
        : 'Contests run on their own page, with the rules and prize details listed up front. Create an account and you will see the next one as soon as it opens.',
    },
    {
      q: 'Does it work on my phone?',
      a: 'Yes. JeetCode is built phone-first, and you can add it to your home screen to open it like an app.',
    },
    {
      q: "I'm just starting. Where do I begin?",
      a: 'Open aptitude pattern 1 or pick an Easy coding problem. The animated lessons explain each concept before you practice it, and the dashboard shows your next step.',
    },
    {
      q: 'Can I cancel Pro?',
      a: 'Yes, anytime from your account. Cancelling stops future renewals and you keep Pro until the end of the period you paid for. Details are on the Refund & Cancellation page.',
    },
  ];

  return (
    <MotionConfig reducedMotion="user">
      <Box
        id="top"
        sx={{
          minHeight: '100dvh',
          bgcolor: 'background.default',
          overflowX: 'hidden',
          '@media (prefers-reduced-motion: reduce)': { '& *': { animation: 'none !important', transition: 'none !important' } },
        }}
      >
        <NavBar authed={authed} onStart={goStart} onLogin={go('/login')} />

        {/* 1. Hero: one outcome promise, one CTA, a working product window. Plain background, no dot grid. */}
        <Box sx={{ position: 'relative' }}>
          <Box aria-hidden="true" sx={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: (t) => `radial-gradient(55% 60% at 80% 20%, ${alpha(t.palette.primary.main, 0.14)}, transparent 70%)` }} />
          <Container maxWidth="lg" sx={{ position: 'relative', pt: { xs: 5, md: 9 }, pb: { xs: 7, md: 10 } }}>
            <Grid container spacing={{ xs: 5, md: 6 }} sx={{ alignItems: 'center' }}>
              <Grid size={{ xs: 12, md: 6 }}>
                {offerEnds && (
                  <Stack direction="row" spacing={1} sx={{ mb: 2.5, px: 1.5, py: 0.6, width: 'fit-content', borderRadius: 99, alignItems: 'center', border: '1px solid', borderColor: (t) => alpha(t.palette.warning.main, 0.5), bgcolor: (t) => alpha(t.palette.warning.main, 0.1) }}>
                    <WorkspacePremiumRoundedIcon sx={{ fontSize: 18, color: 'warning.main' }} />
                    <Typography sx={{ fontWeight: 700, fontSize: '0.86rem' }}>Launch offer: Pro is free until {offerEnds}</Typography>
                  </Stack>
                )}
                <Typography
                  variant="h1"
                  sx={{
                    fontFamily: DISPLAY_FONT,
                    fontWeight: 800,
                    fontSize: { xs: '2.5rem', sm: '3.3rem', md: '3.1rem', lg: '3.6rem' },
                    lineHeight: 1.02,
                    letterSpacing: '-0.035em',
                    textWrap: 'balance',
                    mb: 2.5,
                  }}
                >
                  Your next offer letter starts here.
                </Typography>
                <Typography color="text.secondary" sx={{ fontSize: { xs: '1.15rem', md: '1.3rem' }, maxWidth: '30ch', mb: 4, lineHeight: 1.45, fontWeight: 500 }}>
                  Coding. Aptitude. Company prep. All in one place, and free to start.
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                  <PrimaryCta buttonRef={heroCtaRef} label={startLabel} onClick={goStart} />
                  <Button size="large" variant="outlined" href="#how-it-works" sx={{ fontWeight: 700, px: 3.5, py: 1.3, whiteSpace: 'nowrap', borderWidth: 1.5, '&:hover': { borderWidth: 1.5 } }}>
                    See how it works
                  </Button>
                </Stack>
                <Stack direction="row" useFlexGap sx={{ flexWrap: 'wrap', gap: { xs: 1.25, sm: 2.5 }, mt: 3 }}>
                  {['Free to start', 'No card', 'Instant Google sign-in'].map((t) => (
                    <Stack key={t} direction="row" spacing={0.6} sx={{ alignItems: 'center', color: 'text.secondary' }}>
                      <CheckRoundedIcon sx={{ fontSize: 17, color: 'success.main' }} />
                      <Typography sx={{ fontWeight: 600, fontSize: '0.88rem' }}>{t}</Typography>
                    </Stack>
                  ))}
                </Stack>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Box sx={{ position: 'relative', pb: { xs: 0, sm: 5 } }}>
                  <HeroDemo />
                  <Box sx={{ display: { xs: 'none', sm: 'block' }, position: 'absolute', right: { sm: 0, md: -16 }, bottom: 0, width: { sm: 150, md: 168 }, zIndex: 2, transform: 'rotate(3deg)' }}>
                    <Shot src="/screens/dashboard.png" alt="JeetCode dashboard on a phone" priority />
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Container>
        </Box>

        {/* 2. Proof: real numbers + the companies behind the tags */}
        <ProofBand />

        {/* 3. Is it for me? */}
        <Container id="for-me" maxWidth="lg" sx={{ py: { xs: 8, md: 12 }, scrollMarginTop: 64 }}>
          <SectionHeading align="center" eyebrow="Is it for me?" maxWidth={820}>
            Built for you. Pick your path.
          </SectionHeading>
          <PersonaTabs onGo={go} />
        </Container>

        {/* 4. How it works */}
        <Box id="how-it-works" sx={{ bgcolor: 'background.paper', borderTop: '1px solid', borderBottom: '1px solid', borderColor: 'divider', scrollMarginTop: 64 }}>
          <Container maxWidth="lg" sx={{ py: { xs: 8, md: 11 } }}>
            <SectionHeading align="center" eyebrow="How it works" maxWidth={820}>
              Three simple steps. Two minutes.
            </SectionHeading>
            <StepCards steps={STEPS} />
            <Box sx={{ textAlign: 'center', mt: { xs: 5, md: 7 } }}>
              <PrimaryCta label={startLabel} onClick={goStart} />
            </Box>
          </Container>
        </Box>

        {/* 5. Before / after */}
        <Container maxWidth="lg" sx={{ py: { xs: 8, md: 12 } }}>
          <SectionHeading align="center" eyebrow="Why one place?" maxWidth={820}>
            Stop juggling. Start solving.
          </SectionHeading>
          <BeforeAfter />
        </Container>

        {/* 6. What JeetCode does */}
        <Box id="features" sx={{ bgcolor: 'background.paper', borderTop: '1px solid', borderBottom: '1px solid', borderColor: 'divider', scrollMarginTop: 64 }}>
          <Container maxWidth="lg" sx={{ py: { xs: 8, md: 12 } }}>
            <SectionHeading align="center" eyebrow="What you get" maxWidth={720}>
              Everything you need. Nothing you don't.
            </SectionHeading>
            <Grid container spacing={{ xs: 2.5, md: 3 }}>
              <Grid size={{ xs: 12, md: 7 }}>
                <MiniCard
                  title="See algorithms think"
                  body="15 algorithms, one move at a time."
                  action={<Button onClick={go('/visualizer')} sx={{ alignSelf: 'flex-start', fontWeight: 700, px: 0 }}>Open the visualizer</Button>}
                >
                  <SortVisual />
                </MiniCard>
              </Grid>
              <Grid size={{ xs: 12, md: 5 }}>
                <MiniCard title="Build a streak you can see" body="Practice daily. Fill the squares.">
                  <HeatVisual />
                </MiniCard>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <MiniCard title="Climb from Bronze to Legend" body="Earn points. Chase the leaderboard.">
                  <TierVisual />
                </MiniCard>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <MiniCard title="Plan the week together" body="Shared plans. Nobody drifts alone.">
                  <PlanVisual />
                </MiniCard>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <MiniCard
                  title="Practice on the bus"
                  body="Add to your home screen. Opens like an app."
                  sx={{ bgcolor: (t) => alpha(t.palette.primary.main, 0.07), borderColor: (t) => alpha(t.palette.primary.main, 0.35) }}
                >
                  <Shot
                    src="/screens/problems.png"
                    alt="JeetCode problem on a phone"
                    crop={170}
                    maxWidth={150}
                    fallback={<PhoneIphoneRoundedIcon sx={{ fontSize: 72, color: 'primary.main', opacity: 0.9 }} />}
                  />
                </MiniCard>
              </Grid>
            </Grid>
          </Container>
        </Box>

        {/* 7. Contest: renders only while a contest is open */}
        <ContestBand contest={contest} />

        {/* 8. Pricing: free first, risk reversal, no card */}
        <Container id="pricing" maxWidth="md" sx={{ py: { xs: 8, md: 12 }, scrollMarginTop: 64 }}>
          <SectionHeading align="center" eyebrow="Pricing" maxWidth={680} sub="Free has everything to begin. Pro adds the extras.">
            Start free. Upgrade when you want.
          </SectionHeading>
          <Grid container spacing={{ xs: 4, md: 3 }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <PlanCard name="Free" price="₹0" note="No card. No time limit." points={FREE_FEATURES} cta={startLabel} onCta={goStart} />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <PlanCard
                primary
                badge={offerEnds ? `Free until ${offerEnds}` : undefined}
                name="Pro"
                price={`₹${PRICE_MONTH}`}
                note={`per month, or ₹${PRICE_YEAR.toLocaleString('en-IN')} a year`}
                points={PRO_FEATURES}
                cta={offerEnds ? 'Claim free Pro' : 'See Pro plans'}
                onCta={offerEnds ? goStart : go('/pricing')}
                footnote="Cancel anytime. You keep Pro until your paid period ends."
              />
            </Grid>
          </Grid>
        </Container>

        {/* 9. Founder note */}
        <Box sx={{ bgcolor: 'background.paper', borderTop: '1px solid', borderBottom: '1px solid', borderColor: 'divider' }}>
          <Container maxWidth="md" sx={{ py: { xs: 8, md: 11 } }}>
            <Box sx={{ pl: { xs: 3, md: 5 }, borderLeft: '4px solid', borderColor: 'primary.main' }}>
              <Typography sx={{ fontFamily: DISPLAY_FONT, fontWeight: 700, color: 'text.secondary', mb: 1.5 }}>Why I built this</Typography>
              <Typography sx={{ fontFamily: DISPLAY_FONT, fontWeight: 600, fontSize: { xs: '1.35rem', md: '1.8rem' }, lineHeight: 1.42, letterSpacing: '-0.01em', maxWidth: '38ch', textWrap: 'pretty' }}>
                I lived the scattered prep: tabs everywhere, no clear next step, nobody to practice with. JeetCode is the tool I wish I had.
              </Typography>
            </Box>
          </Container>
        </Box>

        {/* 10. Objections answered */}
        <Container maxWidth="md" sx={{ py: { xs: 8, md: 11 } }}>
          <SectionHeading eyebrow="Still wondering?" maxWidth={560}>Good questions.</SectionHeading>
          <Box>
            {faq.map((f) => (
              <Accordion key={f.q} disableGutters elevation={0} square sx={{ bgcolor: 'transparent', borderBottom: '1px solid', borderColor: 'divider', '&:before': { display: 'none' } }}>
                <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />} sx={{ px: 0, py: 0.75 }}>
                  <Typography sx={{ fontWeight: 700, fontSize: '1.05rem' }}>{f.q}</Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ px: 0, pt: 0, pb: 2.5 }}>
                  <Typography color="text.secondary" sx={{ maxWidth: '64ch', lineHeight: 1.65 }}>{f.a}</Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        </Container>

        {/* 11. Final CTA */}
        <Container maxWidth="lg" sx={{ pb: { xs: 7, md: 10 } }}>
          <Box
            sx={{
              position: 'relative',
              overflow: 'hidden',
              borderRadius: '20px',
              px: { xs: 3, md: 8 },
              py: { xs: 5, md: 7 },
              color: '#fff',
              background: (t) => `linear-gradient(135deg, ${t.palette.primary.dark} 0%, #0F172A 90%)`,
            }}
          >
            <Box aria-hidden="true" sx={{ position: 'absolute', right: -60, top: -80, width: 320, height: 320, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.18), transparent 70%)', animation: `${drift} 10s ease-in-out infinite` }} />
            <Grid container spacing={4} sx={{ alignItems: 'center', position: 'relative' }}>
              <Grid size={{ xs: 12, md: 7 }}>
                <Typography sx={{ fontFamily: DISPLAY_FONT, fontWeight: 800, fontSize: { xs: '2.1rem', md: '3rem' }, lineHeight: 1.06, letterSpacing: '-0.03em', textWrap: 'balance', mb: 1.75 }}>
                  Your next offer letter is waiting.
                </Typography>
                <Typography sx={{ color: alpha('#fff', 0.85), fontSize: '1.1rem', mb: 3.5, maxWidth: '46ch', lineHeight: 1.6 }}>
                  Free account. First problem in two minutes. Bring a friend.
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                  <PrimaryCta light buttonRef={finalCtaRef} label={startLabel} onClick={goStart} />
                  <Button size="large" variant="outlined" onClick={go('/pair')} sx={{ color: '#fff', borderColor: alpha('#fff', 0.5), borderWidth: 1.5, fontWeight: 700, px: 3, py: 1.3, whiteSpace: 'nowrap', '&:hover': { borderColor: '#fff', borderWidth: 1.5, bgcolor: alpha('#fff', 0.08) } }}>
                    Try a pair room
                  </Button>
                </Stack>
              </Grid>
              <Grid size={{ xs: 12, md: 5 }} sx={{ display: 'flex', justifyContent: { xs: 'center', md: 'flex-end' } }}>
                <Box sx={{ transform: 'rotate(4deg)', filter: 'drop-shadow(0 24px 30px rgba(0,0,0,0.35))' }}>
                  <OfferLetter onDark width={190} stampDelay={0.6} />
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Container>

        {/* Footer */}
        <Box component="footer" sx={{ borderTop: '1px solid', borderColor: 'divider', pt: 6, pb: { xs: 12, md: 4 } }}>
          <Container maxWidth="lg">
            <Grid container spacing={4}>
              <Grid size={{ xs: 12, md: 5 }}>
                <Typography sx={{ fontFamily: DISPLAY_FONT, fontWeight: 800, fontSize: '1.35rem', letterSpacing: '-0.02em' }}>
                  Jeet<Box component="span" sx={{ color: 'primary.main' }}>Code</Box>
                </Typography>
                <Typography color="text.secondary" sx={{ mt: 1, maxWidth: '34ch', lineHeight: 1.6 }}>
                  Coding, aptitude and company prep for placement season, one pattern at a time.
                </Typography>
              </Grid>
              <Grid size={{ xs: 6, md: 2.5 }}>
                <FooterCol title="Practice" links={[['Problems', go('/problems')], ['Aptitude', go('/aptitude')], ['Company prep', go('/prep')], ['Visualizer', go('/visualizer')]]} />
              </Grid>
              <Grid size={{ xs: 6, md: 2.5 }}>
                <FooterCol title="Together" links={[['Pair rooms', go('/pair')], ['Contest', go('/contest')], ['Pricing', go('/pricing')]]} />
              </Grid>
              <Grid size={{ xs: 12, md: 2 }}>
                <FooterCol title="Account" links={authed ? [['Dashboard', go('/dashboard')]] : [['Log in', go('/login')], ['Sign up', go('/signup')]]} />
              </Grid>
            </Grid>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 5, maxWidth: '90ch', lineHeight: 1.6 }}>
              Company names and marks belong to their owners. They appear only to show which company a question is tagged to, and do not imply any affiliation or endorsement.
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
              © {new Date().getFullYear()} JeetCode
            </Typography>
            <Stack direction="row" spacing={2} useFlexGap sx={{ mt: 1, flexWrap: 'wrap' }}>
              {[['Privacy Policy', '/privacy'], ['Terms of Service', '/terms'], ['Refund & Cancellation', '/refund']].map(([label, path]) => (
                <Link key={path} component="button" type="button" onClick={go(path)} underline="hover" color="text.secondary" sx={{ font: 'inherit', fontSize: '0.8rem' }}>
                  {label}
                </Link>
              ))}
            </Stack>
          </Container>
        </Box>

        {/* Sticky CTA bar (mobile): visible while neither the hero nor the final CTA is on screen */}
        <AnimatePresence>
          {showSticky && (
            <motion.div
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 22 }}
              style={{ position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 30 }}
            >
              <Box sx={{ display: { xs: 'block', md: 'none' }, p: 1.5, pb: 'calc(12px + env(safe-area-inset-bottom))', bgcolor: (t) => alpha(t.palette.background.paper, 0.94), backdropFilter: 'blur(10px)', borderTop: '1px solid', borderColor: 'divider' }}>
                <PrimaryCta label={startLabel} onClick={goStart} sx={{ width: '100%' }} />
              </Box>
            </motion.div>
          )}
        </AnimatePresence>
      </Box>
    </MotionConfig>
  );
}
