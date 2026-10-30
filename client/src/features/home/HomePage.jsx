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
  useMediaQuery,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded';
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded';
import WorkspacePremiumRoundedIcon from '@mui/icons-material/WorkspacePremiumRounded';

import { apiClient } from '../../api/apiClient';
import { toggleThemeMode } from '../../app/uiSlice';
import { useContest, inr, fmtDuration } from '../contest/contestUtils';
import ContestBand from './ContestBand';
import MobileLanding from './MobileLanding';
import { DISPLAY_FONT } from './anim';

// --- Copy rules for this page -------------------------------------------
// Plain words a student understands in five seconds. One promise (coding +
// aptitude, one place), one action (Start free). No animation that does not
// explain something, no libraries beyond MUI. Hooks may be strong; claims may
// not be false: every number comes from the content in this repo, no invented
// testimonials, no "guaranteed selection". Keep prices in sync with /pricing.
const START = 'Start practicing';

const STATS = [
  { value: '290+', label: 'coding problems' },
  { value: '3,200', label: 'aptitude questions' },
  { value: '32', label: 'patterns' },
];

const STEPS = [
  { title: 'Create your account', body: 'It takes about 30 seconds.' },
  { title: 'Pick where to begin', body: 'Aptitude pattern 1, or an Easy coding problem.' },
  { title: 'Practice a little every day', body: 'Streaks and scores show what is done and what is left.' },
];

const PRO_FEATURES = [
  'Every company-tagged coding problem',
  'Unlimited AI hints',
  'The full TCS NQT aptitude test suite',
  'Priority code judging at peak hours',
];
const FREE_FEATURES = [
  'Coding problems without company tags',
  'Aptitude patterns with lessons',
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

// True while the element is on screen. Plain IntersectionObserver, no library.
function useOnScreen(ref) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return undefined;
    const io = new IntersectionObserver(([e]) => setOn(e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, [ref]);
  return on;
}

// ---------------------------------------------------------------------------

function SectionHeading({ children, sub, align = 'center', maxWidth = 680, sx }) {
  return (
    <Box sx={{ textAlign: align, maxWidth, mx: align === 'center' ? 'auto' : 0, mb: { xs: 4, md: 6 }, ...sx }}>
      <Typography
        variant="h2"
        sx={{ fontFamily: DISPLAY_FONT, fontWeight: 800, fontSize: { xs: '1.9rem', md: '2.6rem' }, lineHeight: 1.1, letterSpacing: '-0.03em', textWrap: 'balance' }}
      >
        {children}
      </Typography>
      {sub && (
        <Typography color="text.secondary" sx={{ mt: 1.5, fontSize: '1.08rem', lineHeight: 1.6, maxWidth: '56ch', mx: align === 'center' ? 'auto' : 0 }}>
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
        ...(light && { bgcolor: '#fff', color: '#1E1B4B', '&:hover': { bgcolor: alpha('#fff', 0.9) } }),
        ...sx,
      }}
    >
      {label}
    </Button>
  );
}

// Real app screenshot (desktop, 16:10) in a small browser frame. Missing file -> nothing.
function Shot({ src, alt, priority = false, sx }) {
  const [failed, setFailed] = useState(false);
  if (failed) return null;
  return (
    <Box sx={{ width: '100%', overflow: 'hidden', borderRadius: '12px', border: '1px solid', borderColor: 'divider', bgcolor: '#0F172A', ...sx }}>
      <Stack direction="row" spacing={0.6} sx={{ alignItems: 'center', px: 1.25, height: 22, bgcolor: alpha('#fff', 0.06) }} aria-hidden>
        {[0, 1, 2].map((i) => (
          <Box key={i} sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: alpha('#fff', 0.28) }} />
        ))}
      </Stack>
      <Box
        component="img"
        src={src}
        alt={alt}
        width={1440}
        height={900}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        decoding="async"
        onError={() => setFailed(true)}
        sx={{ display: 'block', width: '100%', height: 'auto', aspectRatio: '16 / 10', objectFit: 'cover', objectPosition: 'top' }}
      />
    </Box>
  );
}

function NavBar({ authed, onStart, onLogin }) {
  const dispatch = useDispatch();
  const mode = useSelector((s) => s.ui.mode);
  const links = [['What you get', '#features'], ['How it works', '#how-it-works'], ['Pricing', '#pricing']];
  return (
    <Box
      component="header"
      sx={{
        position: 'sticky',
        top: 0,
        zIndex: 20,
        borderBottom: '1px solid',
        borderColor: 'divider',
        bgcolor: (t) => alpha(t.palette.background.default, 0.92),
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
              <Button color="inherit" onClick={onLogin} sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>
                Log in
              </Button>
            )}
            <PrimaryCta size="medium" label={authed ? 'Dashboard' : 'Sign up'} onClick={onStart} sx={{ px: 2.5, py: 0.7 }} />
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}

// One feature: short title, one line, a real screenshot.
function FeatureCard({ title, body, shot, alt, points, onClick, cta }) {
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: '18px', border: '1px solid', borderColor: 'divider', bgcolor: 'background.default', p: { xs: 2.5, md: 3.5 } }}>
      <Typography sx={{ fontFamily: DISPLAY_FONT, fontWeight: 800, fontSize: '1.5rem', letterSpacing: '-0.02em' }}>{title}</Typography>
      <Typography color="text.secondary" sx={{ mt: 0.75, mb: 2, lineHeight: 1.55 }}>{body}</Typography>
      {points && (
        <Stack spacing={1} sx={{ mb: 2.5 }}>
          {points.map((p) => (
            <Stack key={p} direction="row" spacing={1.1} sx={{ alignItems: 'flex-start' }}>
              <CheckRoundedIcon sx={{ fontSize: 20, color: 'success.main', mt: '1px' }} />
              <Typography sx={{ fontWeight: 600, lineHeight: 1.5 }}>{p}</Typography>
            </Stack>
          ))}
        </Stack>
      )}
      <Box sx={{ mt: 'auto' }}>
        {shot && <Shot src={shot} alt={alt} />}
        {cta && (
          <Button onClick={onClick} sx={{ mt: 1.5, px: 0, fontWeight: 700 }}>
            {cta}
          </Button>
        )}
      </Box>
    </Box>
  );
}

function SmallCard({ title, body }) {
  return (
    <Box sx={{ height: '100%', borderRadius: '16px', border: '1px solid', borderColor: 'divider', bgcolor: 'background.default', p: 3 }}>
      <Typography sx={{ fontFamily: DISPLAY_FONT, fontWeight: 800, fontSize: '1.2rem', letterSpacing: '-0.015em' }}>{title}</Typography>
      <Typography color="text.secondary" sx={{ mt: 0.75, lineHeight: 1.55 }}>{body}</Typography>
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
  const theme = useTheme();
  const isPhone = useMediaQuery(theme.breakpoints.down('md'), { noSsr: true });

  const go = (path) => () => navigate(path);
  const goStart = () => navigate(authed ? '/dashboard' : '/signup');
  const startLabel = authed ? 'Open dashboard' : START;

  // Mobile sticky CTA: only while neither the hero CTA nor the final CTA is visible.
  const heroCtaRef = useRef(null);
  const finalCtaRef = useRef(null);
  const heroCtaVisible = useOnScreen(heroCtaRef);
  const finalCtaVisible = useOnScreen(finalCtaRef);
  const showSticky = !heroCtaVisible && !finalCtaVisible;

  const faq = [
    {
      q: 'Is JeetCode really free?',
      a: 'Yes. Sign up and start practicing right away. A few extras, like company-tagged problems and unlimited AI hints, are in JeetCode Pro. Add it only if you want it.',
    },
    {
      q: 'Why one place for coding and aptitude?',
      a: 'Placement tests ask for both. When they sit on one dashboard, you can see what you have covered and what is left, so you stop guessing what to do next.',
    },
    {
      q: "I'm just starting. Where do I begin?",
      a: 'Open aptitude pattern 1, or pick an Easy coding problem. Each aptitude topic has a short lesson first, and your dashboard always shows the next step.',
    },
    {
      q: 'Is the aptitude section only for TCS NQT?',
      a: 'The TCS NQT track is live, with its exam sections and a readiness score. The 32 patterns (percentages, time and work, ratios, probability and more) help in other company aptitude rounds too.',
    },
    {
      q: 'Which languages can I code in?',
      a: 'JavaScript, Python and C++. Every submission runs against test cases and comes back with a verdict.',
    },
    {
      q: 'Can I practice with a friend?',
      a: 'Yes. Create a pair room and send the link. You both get one shared editor with chat, voice and video. Your friend can join as a guest.',
    },
    {
      q: 'Tell me about the contest.',
      a: contest && contest.status !== 'ended'
        ? `The ${contest.title} has ${contest.problemCount} ${contest.difficulty.toLowerCase()} problems, ${fmtDuration(contest.durationMinutes)} on the clock and a ${inr(contest.prizePool)} prize pool. AI tools are banned for the whole contest. Read the rules on the contest page before you apply.`
        : 'Contests run on their own page, with the rules and prizes listed up front. Create an account and you will see the next one as soon as it opens.',
    },
    {
      q: 'Does it work on my phone?',
      a: 'Yes. JeetCode works well on phones, and you can add it to your home screen to open it like an app.',
    },
    {
      q: 'Can I cancel Pro?',
      a: 'Yes, anytime from your account. You keep Pro until the end of the period you paid for. Details are on the Refund & Cancellation page.',
    },
  ];

  // Phones get the Library look (same surface and rules as the dashboard home).
  if (isPhone) {
    return (
      <MobileLanding
        authed={authed}
        offerEnds={offerEnds}
        contest={contest}
        faq={faq}
        startLabel={startLabel}
        goStart={goStart}
        go={go}
        heroCtaRef={heroCtaRef}
        finalCtaRef={finalCtaRef}
        showSticky={showSticky}
        data={{ STATS, STEPS, FREE_FEATURES, PRO_FEATURES, PRICE_MONTH, PRICE_YEAR }}
      />
    );
  }

  return (
    <Box id="top" sx={{ minHeight: '100dvh', bgcolor: 'background.default', overflowX: 'hidden' }}>
      <NavBar authed={authed} onStart={goStart} onLogin={go('/login')} />

      {/* 1. Hero: one promise, one button, one real screenshot. */}
      <Container maxWidth="lg" sx={{ pt: { xs: 5, md: 9 }, pb: { xs: 6, md: 9 } }}>
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
              sx={{ fontFamily: DISPLAY_FONT, fontWeight: 800, fontSize: { xs: '2.4rem', sm: '3.1rem', md: '2.9rem', lg: '3.3rem' }, lineHeight: 1.05, letterSpacing: '-0.035em', textWrap: 'balance', mb: 2.25 }}
            >
              Placement prep for coding and aptitude.
            </Typography>
            <Typography color="text.secondary" sx={{ fontSize: { xs: '1.1rem', md: '1.2rem' }, maxWidth: '38ch', mb: 3.5, lineHeight: 1.5 }}>
              Practice aptitude and coding problems, take timed tests, and see your progress. All in one place.
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
              <PrimaryCta buttonRef={heroCtaRef} label={startLabel} onClick={goStart} />
              <Button size="large" variant="outlined" href="#features" sx={{ fontWeight: 700, px: 3.5, py: 1.3, whiteSpace: 'nowrap', borderWidth: 1.5, '&:hover': { borderWidth: 1.5 } }}>
                See what's inside
              </Button>
            </Stack>
            <Stack direction="row" useFlexGap sx={{ flexWrap: 'wrap', columnGap: 2.5, rowGap: 0.5, mt: 3.5 }}>
              {STATS.map((x) => (
                <Typography key={x.label} color="text.secondary" sx={{ fontSize: '0.92rem', whiteSpace: 'nowrap' }}>
                  <Box component="span" sx={{ fontWeight: 800, color: 'text.primary' }}>{x.value}</Box> {x.label}
                </Typography>
              ))}
            </Stack>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Shot src="/screens/dashboard.png" alt="JeetCode dashboard with coding problems and a streak calendar" priority sx={{ boxShadow: (t) => `0 30px 60px -34px ${alpha(t.palette.primary.main, 0.5)}` }} />
          </Grid>
        </Grid>
      </Container>

      {/* 3. What you get: aptitude + coding side by side, then the extras. */}
      <Container id="features" maxWidth="lg" sx={{ py: { xs: 8, md: 11 }, scrollMarginTop: 64 }}>
        <SectionHeading sub="Aptitude and coding are the two things placement tests ask for. Practice both here.">
          Everything for your placement test
        </SectionHeading>
        <Grid container spacing={{ xs: 2.5, md: 3 }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <FeatureCard
              title="Aptitude"
              body="Learn it, practice it, then test yourself against the clock."
              points={['32 patterns, 3,200 questions', 'A short lesson before every topic', 'Timed tests that unlock the next level']}
              shot="/screens/aptitude.png"
              alt="JeetCode aptitude lesson on percentages"
              cta="Try aptitude"
              onClick={go('/aptitude')}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FeatureCard
              title="Coding"
              body="Write code in the browser and see the result straight away."
              points={['290+ problems from Easy to Hard', 'JavaScript, Python and C++', 'Company tags, so you know what gets asked']}
              shot="/screens/problems.png"
              alt="JeetCode coding problem with the code editor"
              cta="Try a problem"
              onClick={go('/problems')}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <SmallCard title="Company prep" body="Follow a track for TCS NQT and other companies, with a readiness score." />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <SmallCard title="Practice with a friend" body="Share a link. Solve in one editor with chat, voice and video." />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <SmallCard title="Stay on track" body="Daily streaks, a leaderboard and a dashboard that shows your next step." />
          </Grid>
        </Grid>
      </Container>

      {/* 4. How it works: three plain steps, no images. */}
      <Box id="how-it-works" sx={{ bgcolor: 'background.paper', borderTop: '1px solid', borderBottom: '1px solid', borderColor: 'divider', scrollMarginTop: 64 }}>
        <Container maxWidth="lg" sx={{ py: { xs: 8, md: 10 } }}>
          <SectionHeading>Start in two minutes</SectionHeading>
          <Grid container spacing={{ xs: 3, md: 4 }}>
            {STEPS.map((st, i) => (
              <Grid key={st.title} size={{ xs: 12, md: 4 }}>
                <Stack direction="row" spacing={2} sx={{ alignItems: 'flex-start' }}>
                  <Box sx={{ flexShrink: 0, width: 40, height: 40, borderRadius: '12px', display: 'grid', placeItems: 'center', bgcolor: (t) => alpha(t.palette.primary.main, 0.12), color: 'primary.main', fontFamily: DISPLAY_FONT, fontWeight: 800 }}>
                    {i + 1}
                  </Box>
                  <Box>
                    <Typography sx={{ fontFamily: DISPLAY_FONT, fontWeight: 800, fontSize: '1.2rem', letterSpacing: '-0.015em' }}>{st.title}</Typography>
                    <Typography color="text.secondary" sx={{ mt: 0.5, lineHeight: 1.55 }}>{st.body}</Typography>
                  </Box>
                </Stack>
              </Grid>
            ))}
          </Grid>
          <Box sx={{ textAlign: 'center', mt: { xs: 5, md: 6 } }}>
            <PrimaryCta label={startLabel} onClick={goStart} />
          </Box>
        </Container>
      </Box>

      {/* 5. Contest: renders only while a contest is open */}
      <ContestBand contest={contest} />

      {/* 6. Pricing: free first, no card */}
      <Container id="pricing" maxWidth="md" sx={{ py: { xs: 8, md: 11 }, scrollMarginTop: 64 }}>
        <SectionHeading sub="The free plan has everything to begin. Pro adds the extras.">
          Start free. Upgrade only if you want to.
        </SectionHeading>
        <Grid container spacing={{ xs: 4, md: 3 }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <PlanCard name="Free" price="₹0" note="Everything you need to begin." points={FREE_FEATURES} cta={startLabel} onCta={goStart} />
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

      {/* 7. Why it exists */}
      <Box sx={{ bgcolor: 'background.paper', borderTop: '1px solid', borderBottom: '1px solid', borderColor: 'divider' }}>
        <Container maxWidth="md" sx={{ py: { xs: 7, md: 9 } }}>
          <Box sx={{ pl: { xs: 3, md: 5 }, borderLeft: '4px solid', borderColor: 'primary.main' }}>
            <Typography sx={{ fontFamily: DISPLAY_FONT, fontWeight: 700, color: 'text.secondary', mb: 1.5 }}>Why I built this</Typography>
            <Typography sx={{ fontFamily: DISPLAY_FONT, fontWeight: 600, fontSize: { xs: '1.3rem', md: '1.7rem' }, lineHeight: 1.42, letterSpacing: '-0.01em', maxWidth: '38ch', textWrap: 'pretty' }}>
              I lived the scattered prep: tabs everywhere, no clear next step, nobody to practice with. JeetCode is the tool I wish I had.
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* 8. Questions */}
      <Container maxWidth="md" sx={{ py: { xs: 8, md: 10 } }}>
        <SectionHeading align="left" maxWidth={560}>Questions? Answered.</SectionHeading>
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

      {/* 9. Final CTA: plain, no art */}
      <Container maxWidth="lg" sx={{ pb: { xs: 7, md: 10 } }}>
        <Box
          sx={{
            borderRadius: '20px',
            px: { xs: 3, md: 8 },
            py: { xs: 5, md: 7 },
            textAlign: 'center',
            color: '#fff',
            background: (t) => `linear-gradient(135deg, ${t.palette.primary.dark} 0%, #0F172A 90%)`,
          }}
        >
          <Typography sx={{ fontFamily: DISPLAY_FONT, fontWeight: 800, fontSize: { xs: '2rem', md: '2.8rem' }, lineHeight: 1.08, letterSpacing: '-0.03em', textWrap: 'balance', mb: 1.5 }}>
            Your first question is two minutes away.
          </Typography>
          <Typography sx={{ color: alpha('#fff', 0.85), fontSize: '1.1rem', mb: 3.5, lineHeight: 1.6 }}>
            Create your free account and solve your first question.
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ justifyContent: 'center' }}>
            <PrimaryCta light buttonRef={finalCtaRef} label={startLabel} onClick={goStart} />
            <Button size="large" variant="outlined" onClick={go('/pair')} sx={{ color: '#fff', borderColor: alpha('#fff', 0.5), borderWidth: 1.5, fontWeight: 700, px: 3, py: 1.3, whiteSpace: 'nowrap', '&:hover': { borderColor: '#fff', borderWidth: 1.5, bgcolor: alpha('#fff', 0.08) } }}>
              Try a pair room
            </Button>
          </Stack>
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
                Coding, aptitude and company prep for placement season, in one place.
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
            {[['Privacy Policy', '/privacy'], ['Terms of Service', '/terms'], ['Refund & Cancellation', '/refund'], ['Help & Support', '/help']].map(([label, path]) => (
              <Link key={path} component="button" type="button" onClick={go(path)} underline="hover" color="text.secondary" sx={{ font: 'inherit', fontSize: '0.8rem' }}>
                {label}
              </Link>
            ))}
          </Stack>
        </Container>
      </Box>

      {/* Sticky CTA bar (mobile): visible while neither the hero nor the final CTA is on screen */}
      {showSticky && (
        <Box sx={{ display: { xs: 'block', md: 'none' }, position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 30, p: 1.5, pb: 'calc(12px + env(safe-area-inset-bottom))', bgcolor: 'background.paper', borderTop: '1px solid', borderColor: 'divider' }}>
          <PrimaryCta label={startLabel} onClick={goStart} sx={{ width: '100%' }} />
        </Box>
      )}
    </Box>
  );
}
