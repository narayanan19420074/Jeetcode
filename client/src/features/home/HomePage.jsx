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
  Tooltip,
  Typography,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
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
import ChaosToOrder from './art/ChaosToOrder';
import JourneyRoad from './art/JourneyRoad';
import OfferLetter from './art/OfferLetter';
import { ArenaVisual, CompanyVisual, HeatVisual, LabVisual, PlanVisual, RoomVisual, SortVisual, TierVisual } from './art/FeatureVisuals';
import { DISPLAY_FONT, drift, marqueeLeft, marqueeRight } from './anim';

// --- Copy rules for this page -------------------------------------------
// Hooks may be strong; claims may not be false. Every number below comes
// from the content in this repo (problem bank, aptitude bank, tier table,
// pricing page, contest config). Update them when the product grows, never
// round up. No invented testimonials. Sample UI is labelled "sample".
// One label per intent: START = create an account, used everywhere.
const START = 'Start free';

const STATS = [
  { target: 290, suffix: '+', label: 'coding problems' },
  { target: 3200, suffix: '', label: 'aptitude questions' },
  { target: 32, suffix: '', label: 'aptitude patterns' },
  { target: 15, suffix: '', label: 'algorithm visualizations' },
];

// Companies that have tagged coding problems in the bank (real tags).
const TAGGED_COMPANIES = [
  'Amazon', 'Google', 'Meta', 'Microsoft', 'Apple', 'Bloomberg', 'LinkedIn', 'Uber', 'Adobe', 'Airbnb',
  'Dropbox', 'Pinterest', 'PayPal', 'Oracle', 'Goldman Sachs',
];

const STEPS = [
  { title: 'Sign up in one tap', body: 'Use Google or your email. No card, no waitlist.' },
  { title: 'Pick your target', body: 'A company track like TCS NQT, or pattern 1 and an Easy problem.' },
  { title: 'Learn it, then test it', body: 'Animated lessons first, timed practice after, and hints when you are stuck.' },
  { title: 'Track it, then bring a friend', body: 'Readiness and streaks show your gaps. A pair room closes them faster.' },
];

const WHY_ONE_PLACE = [
  'Coding, aptitude and company prep on one dashboard',
  'Readiness scores that show what is left, pattern by pattern',
  'Pair rooms for company, streaks for discipline',
];

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
// Launch offer: the same flag the in-app banner reads. Shown only while real.
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

function SectionHeading({ children, sub, align = 'left', maxWidth = 640, light = false, sx }) {
  return (
    <Box sx={{ textAlign: align, maxWidth, mx: align === 'center' ? 'auto' : 0, mb: { xs: 4, md: 6 }, ...sx }}>
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

function NavBar({ authed, onStart, onLogin }) {
  const dispatch = useDispatch();
  const mode = useSelector((s) => s.ui.mode);
  const links = [['Features', '#features'], ['Pair rooms', '#rooms'], ['Contest', '#contest'], ['Pricing', '#pricing']];
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

// One flagship feature: copy on one side, a working mini-product on the other.
function FeatureRow({ id, title, body, points, cta, onCta, visual, reverse = false }) {
  return (
    <Box id={id} sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: reverse ? '1.1fr 1fr' : '1fr 1.1fr' }, gap: { xs: 4, md: 8 }, alignItems: 'center', scrollMarginTop: 80 }}>
      <Box sx={{ order: { xs: 1, md: reverse ? 2 : 1 } }}>
        <Typography variant="h3" sx={{ fontFamily: DISPLAY_FONT, fontWeight: 800, fontSize: { xs: '1.7rem', md: '2.2rem' }, lineHeight: 1.1, letterSpacing: '-0.025em', textWrap: 'balance', mb: 1.75 }}>
          {title}
        </Typography>
        <Typography color="text.secondary" sx={{ fontSize: '1.06rem', lineHeight: 1.62, mb: 2.5, maxWidth: '52ch' }}>
          {body}
        </Typography>
        <Stack spacing={1.1} sx={{ mb: 3.5 }}>
          {points.map((p) => (
            <Stack key={p} direction="row" spacing={1.25} sx={{ alignItems: 'flex-start' }}>
              <CheckRoundedIcon sx={{ fontSize: 20, color: 'success.main', mt: '2px' }} />
              <Typography sx={{ fontWeight: 600, lineHeight: 1.5 }}>{p}</Typography>
            </Stack>
          ))}
        </Stack>
        <Button variant="outlined" size="large" onClick={onCta} sx={{ fontWeight: 700, px: 3, py: 1.1, borderWidth: 1.5, '&:hover': { borderWidth: 1.5 } }}>
          {cta}
        </Button>
      </Box>
      <Box sx={{ order: { xs: 2, md: reverse ? 1 : 2 }, minWidth: 0 }}>{visual}</Box>
    </Box>
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

function PlanCard({ name, price, note, points, cta, onCta, primary = false, badge }) {
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
  const theme = useTheme();
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

        {/* 1. Hero: outcome promise + a working product window */}
        <Box
          sx={{
            position: 'relative',
            backgroundImage: `radial-gradient(${alpha(theme.palette.text.secondary, 0.2)} 1px, transparent 1px)`,
            backgroundSize: '22px 22px',
          }}
        >
          <Box aria-hidden="true" sx={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: `radial-gradient(55% 60% at 80% 20%, ${alpha(theme.palette.primary.main, 0.14)}, transparent 70%), linear-gradient(180deg, transparent 70%, ${theme.palette.background.default})` }} />
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
                  Get placement‑ready, not just busy.
                </Typography>
                <Typography color="text.secondary" sx={{ fontSize: { xs: '1.08rem', md: '1.18rem' }, maxWidth: '46ch', mb: 4, lineHeight: 1.6 }}>
                  290+ coding problems, 3,200 aptitude questions and company-wise tracks, with a dashboard that shows exactly what is left. Practice alone, or in a live room with a friend.
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                  <PrimaryCta buttonRef={heroCtaRef} label={startLabel} onClick={goStart} />
                  <Button size="large" variant="outlined" href="#features" sx={{ fontWeight: 700, px: 3.5, py: 1.3, whiteSpace: 'nowrap', borderWidth: 1.5, '&:hover': { borderWidth: 1.5 } }}>
                    See what is inside
                  </Button>
                </Stack>
                <Stack direction="row" useFlexGap sx={{ flexWrap: 'wrap', gap: { xs: 1.25, sm: 2.5 }, mt: 3 }}>
                  {['No card needed', 'Sign in with Google', 'Works on your phone'].map((t) => (
                    <Stack key={t} direction="row" spacing={0.6} sx={{ alignItems: 'center', color: 'text.secondary' }}>
                      <CheckRoundedIcon sx={{ fontSize: 17, color: 'success.main' }} />
                      <Typography sx={{ fontWeight: 600, fontSize: '0.88rem' }}>{t}</Typography>
                    </Stack>
                  ))}
                </Stack>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <HeroDemo />
              </Grid>
            </Grid>
          </Container>
        </Box>

        {/* 2. Proof: real numbers + the companies behind the tags */}
        <ProofBand />

        {/* 3. Problem: scattered prep, played out visually */}
        <Container maxWidth="lg" sx={{ py: { xs: 8, md: 12 } }}>
          <Grid container spacing={{ xs: 5, md: 8 }} sx={{ alignItems: 'center' }}>
            <Grid size={{ xs: 12, md: 6 }} sx={{ order: { xs: 2, md: 1 } }}>
              <ChaosToOrder />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }} sx={{ order: { xs: 1, md: 2 } }}>
              <SectionHeading sub="Hopping between apps feels busy, not productive. Put your prep in one place and every session starts with an obvious next move.">
                Five tabs open. No idea what you have covered.
              </SectionHeading>
              <Stack spacing={1.5} sx={{ mt: -2 }}>
                {WHY_ONE_PLACE.map((line) => (
                  <Stack key={line} direction="row" spacing={1.25} sx={{ alignItems: 'flex-start' }}>
                    <CheckCircleRoundedIcon sx={{ fontSize: 22, color: 'success.main', mt: '1px' }} />
                    <Typography sx={{ fontWeight: 600 }}>{line}</Typography>
                  </Stack>
                ))}
              </Stack>
            </Grid>
          </Grid>
        </Container>

        {/* 4. Flagship features */}
        <Box id="features" sx={{ bgcolor: 'background.paper', borderTop: '1px solid', borderBottom: '1px solid', borderColor: 'divider', scrollMarginTop: 64 }}>
          <Container maxWidth="lg" sx={{ py: { xs: 8, md: 12 } }}>
            <SectionHeading maxWidth={720} sub="Coding rounds, aptitude papers, company exams and a friend to practice with. Each one works on its own, and they add up together.">
              Everything the drive throws at you
            </SectionHeading>
            <Stack spacing={{ xs: 9, md: 14 }}>
              <FeatureRow
                title="Solve it, run it, get a real verdict"
                body="Write in JavaScript, Python or C++ and submit against real test cases. Filter by difficulty, topic or company, and work through the Striver SDE sheet in order."
                points={['290+ problems from Easy to Hard', 'Company tags from Amazon, Google, Meta, Microsoft and more', 'AI hints that nudge you without giving the answer away']}
                cta="Open the problem list"
                onCta={go('/problems')}
                visual={<ArenaVisual />}
              />
              <FeatureRow
                reverse
                title="Learn the concept. Then beat the clock."
                body="32 aptitude patterns, from Number System to Probability. Each one has animated lessons, graded practice and a timed test. Clear the pass mark and the next pattern opens."
                points={['3,200 questions across 32 patterns', 'Lessons that play the problem before the formula', 'Exam-style tests with a question palette and a timer']}
                cta="Explore aptitude patterns"
                onCta={go('/aptitude')}
                visual={<LabVisual />}
              />
              <FeatureRow
                title="Prep for the company, not just the topic"
                body="Pick a company and follow its exam. Sections, timings and weights are laid out as a roadmap, and a readiness score moves as you practice. TCS NQT is live now."
                points={['Roadmaps built from the real exam pattern', 'A readiness score for every section', 'Every other company: browse its tagged coding problems']}
                cta="Browse company prep"
                onCta={go('/prep')}
                visual={<CompanyVisual />}
              />
              <FeatureRow
                id="rooms"
                reverse
                title="Practice with a friend, live"
                body="Create a room, share the link and code together. One shared editor, live chat, voice and video, and one Run button for both of you. Works for coding and for aptitude, and your friend can join as a guest."
                points={['Both of you type in the same editor at once', 'Chat, voice and video inside the room', 'Run the code together and see the same output', 'Phone-friendly keys and auto-indent']}
                cta="Start a pair room"
                onCta={go('/pair')}
                visual={<RoomVisual />}
              />
            </Stack>
          </Container>
        </Box>

        {/* 5. The details that keep you going */}
        <Container maxWidth="lg" sx={{ py: { xs: 8, md: 12 } }}>
          <SectionHeading maxWidth={700} sub="Small things that make you open the app again tomorrow.">
            Built to keep you coming back
          </SectionHeading>
          <Grid container spacing={{ xs: 2.5, md: 3 }}>
            <Grid size={{ xs: 12, md: 7 }}>
              <MiniCard
                title="See algorithms think"
                body="15 algorithms across sorting, searching, graphs, trees and dynamic programming, stepped through one move at a time."
                action={<Button onClick={go('/visualizer')} sx={{ alignSelf: 'flex-start', fontWeight: 700, px: 0 }}>Open the visualizer</Button>}
              >
                <SortVisual />
              </MiniCard>
            </Grid>
            <Grid size={{ xs: 12, md: 5 }}>
              <MiniCard title="Build a streak you can see" body="Every day you practice fills a square. Miss one and you will want to fix it.">
                <HeatVisual />
              </MiniCard>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <MiniCard title="Climb from Bronze to Legend" body="Points for every solve, a leaderboard to chase.">
                <TierVisual />
              </MiniCard>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <MiniCard title="Plan the week together" body="Shared study plans with a calendar, so nobody drifts alone.">
                <PlanVisual />
              </MiniCard>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <MiniCard
                title="Practice on the bus"
                body="Add JeetCode to your home screen and it opens like an app, with navigation built for one thumb."
                sx={{ bgcolor: (t) => alpha(t.palette.primary.main, 0.07), borderColor: (t) => alpha(t.palette.primary.main, 0.35) }}
              >
                <PhoneIphoneRoundedIcon sx={{ fontSize: 72, color: 'primary.main', opacity: 0.9 }} />
              </MiniCard>
            </Grid>
          </Grid>
        </Container>

        {/* 6. Contest: the one loud moment (renders only while a contest is open) */}
        <ContestBand contest={contest} />

        {/* 7. Journey: a road that draws itself on scroll */}
        <Box id="how-it-works" sx={{ bgcolor: 'background.paper', borderTop: '1px solid', borderBottom: '1px solid', borderColor: 'divider', scrollMarginTop: 64 }}>
          <Container maxWidth="lg" sx={{ py: { xs: 8, md: 11 } }}>
            <SectionHeading align="center" maxWidth={820}>
              Start in two minutes. Stay on track for months.
            </SectionHeading>
            <JourneyRoad steps={STEPS} />
            <Box sx={{ textAlign: 'center', mt: { xs: 5, md: 7 } }}>
              <PrimaryCta label={startLabel} onClick={goStart} />
            </Box>
          </Container>
        </Box>

        {/* 8. Pricing: free first, Pro when you want more */}
        <Container id="pricing" maxWidth="md" sx={{ py: { xs: 8, md: 12 }, scrollMarginTop: 64 }}>
          <SectionHeading align="center" maxWidth={680} sub="Everything you need to start is free. Pro adds the company-tagged problems and the full test suite.">
            Start free. Upgrade when you want more.
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
                I went through the same scattered prep everyone does: one tab for problems, another for aptitude, a mental spreadsheet for what was covered, and nobody to practice with. JeetCode is the tool I wish I had.
              </Typography>
            </Box>
          </Container>
        </Box>

        {/* 10. Objections answered */}
        <Container maxWidth="md" sx={{ py: { xs: 8, md: 11 } }}>
          <SectionHeading maxWidth={560}>Questions before you start</SectionHeading>
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

        {/* 11. Final CTA: the outcome, stamped */}
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
                  Your offer letter will not prep itself.
                </Typography>
                <Typography sx={{ color: alpha('#fff', 0.85), fontSize: '1.1rem', mb: 3.5, maxWidth: '46ch', lineHeight: 1.6 }}>
                  Create a free account, solve your first problem in two minutes, then send a friend the link to your first pair room.
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

        {/* Mobile-only sticky CTA */}
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
