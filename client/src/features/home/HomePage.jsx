import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Container,
  Grid,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import { AnimatePresence, MotionConfig, animate, motion, useInView } from 'framer-motion';

import HeroScene from './art/HeroScene';
import ChaosToOrder from './art/ChaosToOrder';
import JourneyRoad from './art/JourneyRoad';
import OfferLetter from './art/OfferLetter';
import { AptitudeVisual, CodingVisual, ProgressVisual } from './art/PillarVisuals';
import { DISPLAY_FONT, confetti, glyphFloat, drift, marqueeLeft, marqueeRight } from './anim';

// --- Copy rules for this page -------------------------------------------
// Hooks are allowed to be strong; claims are not allowed to be false.
// Every number below is real and should be updated as the product grows
// (never rounded up). No fake testimonials, no countdown urgency.
// Sample UI in the illustrations is labelled as sample.
const CTA_LABEL = 'Start free'; // one label per intent, used everywhere

const STATS = [
  { target: 300, suffix: '+', label: 'Coding problems' },
  { target: 275, suffix: '+', label: 'Aptitude questions' },
  { target: 10, suffix: '', label: 'Aptitude patterns' },
  { target: 3, suffix: '', label: 'Languages: JavaScript, Python, C++' },
];

const STEPS = [
  { title: 'Create a free account', body: 'No card, no waitlist. Start browsing problems and patterns right away.' },
  { title: 'Pick your starting point', body: 'A coding problem by difficulty or company, or aptitude pattern 1.' },
  { title: 'Learn it, then test it', body: 'Animated concept lessons first, then timed practice the way the real test runs.' },
  { title: 'Watch the gaps close', body: 'Streaks, solved counts and pattern completion show exactly what is left.' },
];

const WHY_ONE_PLACE = [
  'Coding, aptitude and company prep in one dashboard',
  'Pattern-wise progress you can read at a glance',
  'TCS NQT-style aptitude tests, timed the way the real one is',
];

const FAQ = [
  {
    q: 'Is JeetCode really free to start?',
    a: 'Yes. Create an account without a card and start practicing straight away. Some problems are part of JeetCode Pro, which you can add later if you want them.',
  },
  {
    q: 'Which languages can I code in?',
    a: 'JavaScript, Python and C++. Every submission runs against test cases and you get a verdict on it.',
  },
  {
    q: 'Is the aptitude section only for TCS NQT?',
    a: 'The questions follow the TCS NQT style. The patterns (percentages, time and work, ratios and more) are also useful for other company aptitude rounds.',
  },
  {
    q: "I'm just starting. Where do I begin?",
    a: 'Pick an Easy coding problem, or open aptitude pattern 1. The animated lessons explain each concept before you practice it.',
  },
];

// Logo-badge style: initials in a coloured rounded square. Reads as a logo
// wall without reproducing any real trademarked mark.
const BADGE_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#0EA5E9'];
const COMPANIES = [
  'TCS', 'Infosys', 'Wipro', 'Accenture', 'Cognizant', 'Capgemini',
  'HCL Tech', 'Tech Mahindra', 'IBM', 'Amazon', 'Deloitte', 'LTI Mindtree',
].map((name, i) => ({
  name,
  initials: name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase(),
  color: BADGE_COLORS[i % BADGE_COLORS.length],
}));

// ---------------------------------------------------------------------------

function Reveal({ children, delay = 0, sx }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ type: 'spring', stiffness: 100, damping: 20, delay }}
      style={sx}
    >
      {children}
    </motion.div>
  );
}

function SectionHeading({ children, sub, align = 'left', maxWidth = 620 }) {
  return (
    <Box sx={{ textAlign: align, maxWidth, mx: align === 'center' ? 'auto' : 0, mb: { xs: 4, md: 6 } }}>
      <Typography
        variant="h2"
        sx={{
          fontFamily: DISPLAY_FONT,
          fontWeight: 800,
          fontSize: { xs: '1.9rem', md: '2.6rem' },
          lineHeight: 1.1,
          letterSpacing: '-0.025em',
          textWrap: 'balance',
        }}
      >
        {children}
      </Typography>
      {sub && (
        <Typography color="text.secondary" sx={{ mt: 1.5, fontSize: '1.05rem', maxWidth: '58ch', mx: align === 'center' ? 'auto' : 0 }}>
          {sub}
        </Typography>
      )}
    </Box>
  );
}

function PrimaryCta({ onClick, size = 'large', sx, buttonRef, light = false }) {
  return (
    <Button
      ref={buttonRef}
      size={size}
      variant="contained"
      disableElevation
      endIcon={<ArrowForwardRoundedIcon />}
      onClick={onClick}
      sx={{
        fontWeight: 800,
        px: 3.5,
        py: 1.3,
        whiteSpace: 'nowrap',
        transition: 'transform 0.18s ease, box-shadow 0.18s ease',
        '&:hover': { transform: 'translateY(-2px)', boxShadow: (t) => `0 12px 24px -10px ${alpha(t.palette.primary.main, 0.7)}` },
        '&:active': { transform: 'translateY(0) scale(0.98)' },
        ...(light && { bgcolor: '#fff', color: 'primary.dark', '&:hover': { bgcolor: '#fff', transform: 'translateY(-2px)' } }),
        ...sx,
      }}
    >
      {CTA_LABEL}
    </Button>
  );
}

function NavBar({ onStart, onLogin }) {
  return (
    <Box
      component="header"
      sx={{
        position: 'sticky',
        top: 0,
        zIndex: 20,
        borderBottom: '1px solid',
        borderColor: 'divider',
        bgcolor: (t) => alpha(t.palette.background.paper, 0.85),
        backdropFilter: 'blur(10px)',
      }}
    >
      <Container maxWidth="lg">
        <Stack direction="row" sx={{ height: 64, alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography sx={{ fontFamily: DISPLAY_FONT, fontWeight: 800, fontSize: '1.3rem' }}>
            Jeet<Box component="span" sx={{ color: 'primary.main' }}>Code</Box>
          </Typography>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <Button color="inherit" onClick={onLogin} sx={{ fontWeight: 700 }}>
              Log in
            </Button>
            <PrimaryCta size="medium" onClick={onStart} sx={{ px: 2.5, py: 0.7 }} />
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}

function LogoRow({ items, direction, duration }) {
  const tiled = [...items, ...items, ...items, ...items];
  return (
    <Box
      sx={{
        display: 'flex',
        width: 'max-content',
        gap: 4,
        animation: `${direction === 'left' ? marqueeLeft : marqueeRight} ${duration}s linear infinite`,
        '&:hover': { animationPlayState: 'paused' },
      }}
    >
      {tiled.map((c, i) => (
        <Stack key={`${c.name}-${i}`} direction="row" spacing={1} sx={{ alignItems: 'center', whiteSpace: 'nowrap' }}>
          <Box
            sx={{
              width: 30,
              height: 30,
              borderRadius: '8px',
              border: '1.5px solid',
              borderColor: c.color,
              color: c.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.66rem',
              fontWeight: 800,
            }}
          >
            {c.initials}
          </Box>
          <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.secondary' }}>
            {c.name}
          </Typography>
        </Stack>
      ))}
    </Box>
  );
}

function CompanyMarquee() {
  const half = Math.ceil(COMPANIES.length / 2);
  const mask = 'linear-gradient(90deg, transparent, black 8%, black 92%, transparent)';
  return (
    <Box sx={{ borderTop: '1px solid', borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mb: 2, fontWeight: 600 }}>
          Practice for roles at companies like these
        </Typography>
        <Stack spacing={1.75}>
          {[
            { items: COMPANIES.slice(0, half), direction: 'left', duration: 30 },
            { items: COMPANIES.slice(half), direction: 'right', duration: 34 },
          ].map((row, i) => (
            <Box key={i} sx={{ overflow: 'hidden', maskImage: mask, WebkitMaskImage: mask }}>
              <LogoRow {...row} />
            </Box>
          ))}
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
    const controls = animate(0, target, {
      duration: 1.5,
      ease: 'easeOut',
      onUpdate: (v) => setValue(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, target]);

  return (
    <Box ref={ref}>
      <Typography
        sx={{ fontFamily: DISPLAY_FONT, fontWeight: 800, fontSize: { xs: '2.6rem', md: '3.6rem' }, lineHeight: 1, color: '#fff' }}
      >
        {value}
        {suffix}
      </Typography>
      <Typography sx={{ mt: 1, color: 'rgba(255,255,255,0.8)', fontWeight: 600, fontSize: '0.95rem' }}>
        {label}
      </Typography>
    </Box>
  );
}

function StatsBand() {
  const glyphs = [
    { ch: '{ }', top: '6%', left: '52%', r: '-8deg', d: 7 },
    { ch: '%', top: '52%', left: '60%', r: '10deg', d: 9 },
    { ch: '</>', top: '8%', left: '76%', r: '6deg', d: 8 },
    { ch: '∑', top: '55%', left: '90%', r: '-10deg', d: 10 },
  ];
  return (
    <Box
      sx={{
        position: 'relative',
        overflow: 'hidden',
        background: (t) => `linear-gradient(135deg, ${t.palette.primary.dark} 0%, #0F172A 85%)`,
      }}
    >
      {glyphs.map((g) => (
        <Box
          key={g.ch}
          aria-hidden="true"
          sx={{
            position: 'absolute',
            top: g.top,
            left: g.left,
            '--r': g.r,
            fontFamily: DISPLAY_FONT,
            fontWeight: 800,
            fontSize: { xs: '4rem', md: '7rem' },
            color: 'rgba(255,255,255,0.07)',
            userSelect: 'none',
            animation: `${glyphFloat} ${g.d}s ease-in-out infinite`,
          }}
        >
          {g.ch}
        </Box>
      ))}
      <Container maxWidth="lg" sx={{ position: 'relative', py: { xs: 7, md: 9 } }}>
        <Typography
          sx={{
            fontFamily: DISPLAY_FONT,
            fontWeight: 800,
            color: '#fff',
            fontSize: { xs: '1.7rem', md: '2.2rem' },
            letterSpacing: '-0.02em',
            lineHeight: 1.15,
            mb: { xs: 4, md: 5 },
            maxWidth: 520,
          }}
        >
          The practice is already here. Just show up.
        </Typography>
        <Grid container spacing={{ xs: 4, md: 3 }}>
          {STATS.map((s) => (
            <Grid key={s.label} size={{ xs: 6, md: 3 }}>
              <StatItem {...s} />
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}

function BentoCard({ children, title, body, sx, tint, row = false }) {
  const copy = (
    <Box>
      <Typography sx={{ fontFamily: DISPLAY_FONT, fontWeight: 700, fontSize: '1.35rem', mb: 0.75 }}>{title}</Typography>
      <Typography color="text.secondary" sx={{ mb: row ? 0 : 2.5, maxWidth: '52ch' }}>
        {body}
      </Typography>
    </Box>
  );
  return (
    <Paper
      variant="outlined"
      sx={{
        borderRadius: '16px',
        p: { xs: 2.5, md: 3.5 },
        height: '100%',
        bgcolor: (t) => (tint ? alpha(t.palette[tint].main, 0.06) : 'background.paper'),
        borderColor: (t) => (tint ? alpha(t.palette[tint].main, 0.35) : 'divider'),
        ...(row && {
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '5fr 7fr' },
          gap: { xs: 2.5, md: 5 },
          alignItems: 'center',
        }),
        ...sx,
      }}
    >
      {copy}
      {children}
    </Paper>
  );
}

function ConfettiBits() {
  const bits = [
    { left: '8%', bottom: '10%', c: '#F59E0B', d: 0, w: 10, h: 6 },
    { left: '22%', bottom: '4%', c: '#10B981', d: 0.6, w: 7, h: 7 },
    { left: '45%', bottom: '14%', c: '#fff', d: 1.2, w: 9, h: 5 },
    { left: '63%', bottom: '2%', c: '#EF4444', d: 0.3, w: 8, h: 8 },
    { left: '78%', bottom: '12%', c: '#F59E0B', d: 1.5, w: 11, h: 6 },
    { left: '92%', bottom: '6%', c: '#10B981', d: 0.9, w: 7, h: 7 },
  ];
  return bits.map((b, i) => (
    <Box
      key={i}
      aria-hidden="true"
      sx={{
        position: 'absolute',
        left: b.left,
        bottom: b.bottom,
        width: b.w,
        height: b.h,
        borderRadius: '2px',
        bgcolor: b.c,
        animation: `${confetti} 3.6s ease-out ${b.d}s infinite`,
      }}
    />
  ));
}

export default function HomePage() {
  const navigate = useNavigate();
  const theme = useTheme();
  const goSignup = () => navigate('/signup');

  // Mobile sticky CTA: shown only while neither the hero CTA nor the final
  // CTA is on screen, so it never doubles up with them.
  const heroCtaRef = useRef(null);
  const finalCtaRef = useRef(null);
  const heroCtaVisible = useInView(heroCtaRef);
  const finalCtaVisible = useInView(finalCtaRef);
  const showSticky = !heroCtaVisible && !finalCtaVisible;

  return (
    <MotionConfig reducedMotion="user">
      <Box
        sx={{
          minHeight: '100dvh',
          bgcolor: 'background.default',
          overflowX: 'hidden',
          '@media (prefers-reduced-motion: reduce)': {
            '& *': { animation: 'none !important', transition: 'none !important' },
          },
        }}
      >
        <NavBar onStart={goSignup} onLogin={() => navigate('/login')} />

        {/* 1. Hero: loss-aversion hook + a live "solve, answer, get selected" scene */}
        <Box
          sx={{
            position: 'relative',
            backgroundImage: `radial-gradient(${alpha(theme.palette.text.secondary, 0.22)} 1px, transparent 1px)`,
            backgroundSize: '22px 22px',
            maskImage: 'none',
          }}
        >
          <Container maxWidth="lg" sx={{ pt: { xs: 5, md: 8 }, pb: { xs: 6, md: 8 } }}>
            <Grid container spacing={{ xs: 5, md: 4 }} sx={{ alignItems: 'center' }}>
              <Grid size={{ xs: 12, md: 7 }}>
                <Typography
                  variant="h1"
                  sx={{
                    fontFamily: DISPLAY_FONT,
                    fontWeight: 800,
                    fontSize: { xs: '2.35rem', sm: '3rem', md: '3.4rem', lg: '3.75rem' },
                    lineHeight: 1.04,
                    letterSpacing: '-0.035em',
                    mb: 2.5,
                  }}
                >
                  Don&rsquo;t lose the offer in the round you skipped.
                </Typography>
                <Typography color="text.secondary" sx={{ fontSize: '1.15rem', maxWidth: '48ch', mb: 4, lineHeight: 1.6 }}>
                  Practice 300+ coding problems and TCS NQT-style aptitude tests in one place, with a dashboard that
                  shows what&rsquo;s left.
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                  <PrimaryCta buttonRef={heroCtaRef} onClick={goSignup} />
                  <Button
                    size="large"
                    variant="outlined"
                    href="#how-it-works"
                    sx={{ fontWeight: 700, px: 3.5, py: 1.3, whiteSpace: 'nowrap' }}
                  >
                    See how it works
                  </Button>
                </Stack>
              </Grid>
              <Grid size={{ xs: 12, md: 5 }}>
                <HeroScene />
              </Grid>
            </Grid>
          </Container>
        </Box>

        {/* 2. Logo wall (the page's only marquee) */}
        <CompanyMarquee />

        {/* 3. Pain: the scattered-tabs problem, played out visually */}
        <Container maxWidth="lg" sx={{ py: { xs: 8, md: 12 } }}>
          <Grid container spacing={{ xs: 5, md: 8 }} sx={{ alignItems: 'center' }}>
            <Grid size={{ xs: 12, md: 6 }} sx={{ order: { xs: 2, md: 1 } }}>
              <ChaosToOrder />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }} sx={{ order: { xs: 1, md: 2 } }}>
              <Reveal>
                <SectionHeading sub="Hopping between apps feels busy, not productive. Put your prep in one place and every session has an obvious next move.">
                  Five tabs. No idea what you&rsquo;ve covered.
                </SectionHeading>
                <Stack spacing={1.5} sx={{ mt: -2 }}>
                  {WHY_ONE_PLACE.map((line) => (
                    <Stack key={line} direction="row" spacing={1.25} sx={{ alignItems: 'flex-start' }}>
                      <CheckCircleRoundedIcon sx={{ fontSize: 22, color: 'success.main', mt: '1px' }} />
                      <Typography sx={{ fontWeight: 600 }}>{line}</Typography>
                    </Stack>
                  ))}
                </Stack>
              </Reveal>
            </Grid>
          </Grid>
        </Container>

        {/* 4. Journey: road that draws itself on scroll */}
        <Box id="how-it-works" sx={{ bgcolor: 'background.paper', borderTop: '1px solid', borderBottom: '1px solid', borderColor: 'divider', scrollMarginTop: 64 }}>
          <Container maxWidth="lg" sx={{ py: { xs: 8, md: 11 } }}>
            <Reveal>
              <SectionHeading align="center" maxWidth={820}>
                Four steps from signup to interview‑ready
              </SectionHeading>
            </Reveal>
            <JourneyRoad steps={STEPS} />
          </Container>
        </Box>

        {/* 5. Bento: the two rounds + the dashboard that ties them together */}
        <Container maxWidth="lg" sx={{ py: { xs: 8, md: 12 } }}>
          <Reveal>
            <SectionHeading sub="Real test cases for code. Timed tests for aptitude. One dashboard.">
              Built for the rounds you&rsquo;ll actually face
            </SectionHeading>
          </Reveal>
          <Grid container spacing={{ xs: 2.5, md: 3 }}>
            <Grid size={{ xs: 12, md: 7 }}>
              <BentoCard
                tint="primary"
                title="Code against real test cases"
                body="Solve in JavaScript, Python or C++. Each submission is judged on real test cases, not on whether the output looks right."
              >
                <CodingVisual />
              </BentoCard>
            </Grid>
            <Grid size={{ xs: 12, md: 5 }}>
              <BentoCard
                tint="success"
                title="Aptitude, one pattern at a time"
                body="TCS NQT-style questions grouped by pattern. Learn the concept, practice, then take it timed."
              >
                <AptitudeVisual />
              </BentoCard>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <BentoCard
                row
                title="See progress, not just effort"
                body="Streaks, solved counts and pattern completion on one dashboard, so you always know where you stand."
              >
                <ProgressVisual />
              </BentoCard>
            </Grid>
          </Grid>
        </Container>

        {/* 6. Real numbers, counted up */}
        <StatsBand />

        {/* 7. Founder note */}
        <Container maxWidth="md" sx={{ py: { xs: 8, md: 11 } }}>
          <Reveal>
            <Box sx={{ position: 'relative', pl: { xs: 3, md: 5 }, borderLeft: '4px solid', borderColor: 'primary.main' }}>
              <Typography sx={{ fontFamily: DISPLAY_FONT, fontWeight: 700, color: 'text.secondary', mb: 1.5 }}>
                Why I built this
              </Typography>
              <Typography
                sx={{
                  fontFamily: DISPLAY_FONT,
                  fontWeight: 600,
                  fontSize: { xs: '1.35rem', md: '1.75rem' },
                  lineHeight: 1.45,
                  letterSpacing: '-0.01em',
                  maxWidth: '36ch',
                }}
              >
                I&rsquo;ve been through the same scattered prep everyone else has: one tab for problems, another for
                aptitude, a mental spreadsheet for what&rsquo;s covered. JeetCode is the tool I wish existed.
              </Typography>
            </Box>
          </Reveal>
        </Container>

        {/* 8. Objections answered */}
        <Box sx={{ bgcolor: 'background.paper', borderTop: '1px solid', borderBottom: '1px solid', borderColor: 'divider' }}>
          <Container maxWidth="md" sx={{ py: { xs: 8, md: 10 } }}>
            <Reveal>
              <SectionHeading maxWidth={560}>Questions before you start</SectionHeading>
            </Reveal>
            <Box>
              {FAQ.map((f) => (
                <Accordion
                  key={f.q}
                  disableGutters
                  elevation={0}
                  square
                  sx={{
                    bgcolor: 'transparent',
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    '&:before': { display: 'none' },
                  }}
                >
                  <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />} sx={{ px: 0, py: 0.75 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: '1.05rem' }}>{f.q}</Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ px: 0, pt: 0, pb: 2.5 }}>
                    <Typography color="text.secondary" sx={{ maxWidth: '62ch' }}>
                      {f.a}
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>
          </Container>
        </Box>

        {/* 9. Final CTA: the outcome, stamped */}
        <Container maxWidth="lg" sx={{ py: { xs: 7, md: 10 } }}>
          <Box
            sx={{
              position: 'relative',
              overflow: 'hidden',
              borderRadius: '16px',
              px: { xs: 3, md: 8 },
              py: { xs: 5, md: 7 },
              color: '#fff',
              background: (t) => `linear-gradient(135deg, ${t.palette.primary.dark} 0%, #0F172A 90%)`,
            }}
          >
            <Box
              aria-hidden="true"
              sx={{
                position: 'absolute',
                right: -60,
                top: -80,
                width: 320,
                height: 320,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(255,255,255,0.18), transparent 70%)',
                animation: `${drift} 10s ease-in-out infinite`,
              }}
            />
            <ConfettiBits />
            <Grid container spacing={4} sx={{ alignItems: 'center', position: 'relative' }}>
              <Grid size={{ xs: 12, md: 7 }}>
                <Typography
                  sx={{
                    fontFamily: DISPLAY_FONT,
                    fontWeight: 800,
                    fontSize: { xs: '2rem', md: '2.9rem' },
                    lineHeight: 1.08,
                    letterSpacing: '-0.03em',
                    textWrap: 'balance',
                    mb: 1.5,
                  }}
                >
                  Your offer letter won&rsquo;t prep itself.
                </Typography>
                <Typography sx={{ color: 'rgba(255,255,255,0.85)', fontSize: '1.1rem', mb: 3.5, maxWidth: '44ch' }}>
                  Create a free account and solve your first problem today. No card needed.
                </Typography>
                <PrimaryCta light buttonRef={finalCtaRef} onClick={goSignup} />
              </Grid>
              <Grid size={{ xs: 12, md: 5 }} sx={{ display: 'flex', justifyContent: { xs: 'center', md: 'flex-end' } }}>
                <Box sx={{ transform: 'rotate(4deg)', filter: 'drop-shadow(0 24px 30px rgba(0,0,0,0.35))' }}>
                  <OfferLetter onDark width={190} stampDelay={0.6} />
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Container>

        <Box component="footer" sx={{ borderTop: '1px solid', borderColor: 'divider', py: 3, pb: { xs: 10, md: 3 } }}>
          <Container maxWidth="lg">
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
              © {new Date().getFullYear()} JeetCode. Built for placement prep, one pattern at a time.
            </Typography>
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
              <Box
                sx={{
                  display: { xs: 'block', md: 'none' },
                  p: 1.5,
                  bgcolor: (t) => alpha(t.palette.background.paper, 0.94),
                  backdropFilter: 'blur(10px)',
                  borderTop: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <PrimaryCta onClick={goSignup} sx={{ width: '100%' }} />
              </Box>
            </motion.div>
          )}
        </AnimatePresence>
      </Box>
    </MotionConfig>
  );
}
