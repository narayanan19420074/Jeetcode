import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Stack,
  Grid,
  Divider,
  Chip,
  LinearProgress,
} from '@mui/material';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import CalculateRoundedIcon from '@mui/icons-material/CalculateRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';

// --- Copy is intentionally honest, not hyped: real numbers only, no fake
// testimonials, no countdown-timer urgency. Calm/mentor tone per the
// product's chosen voice. Update STATS below as real numbers grow — never
// round up or exaggerate; understating is safer for trust than the reverse.
const STATS = [
  { target: 300, suffix: '+', label: 'Coding problems' },
  { target: 10, suffix: '', label: 'Aptitude patterns' },
  { target: 275, suffix: '+', label: 'Aptitude questions' },
  { target: 3, suffix: '', label: 'Languages supported' },
];

const PILLARS = [
  {
    icon: CodeRoundedIcon,
    title: 'Structured coding practice',
    body: 'Problems tagged by difficulty and company, judged against real test cases — not just "does it look right."',
  },
  {
    icon: CalculateRoundedIcon,
    title: 'Pattern-wise aptitude training',
    body: 'TCS NQT-style questions organized by pattern. Practice at your own pace, then take a timed test when you\u2019re ready.',
  },
  {
    icon: TrendingUpRoundedIcon,
    title: 'One dashboard, real progress',
    body: 'Streaks, solved counts, pattern completion — so you always know exactly where you stand, not just that you\u2019re "doing something."',
  },
];

const STEPS = [
  { n: '1', title: 'Create your free account', body: 'No credit card, no waitlist — start browsing problems and patterns right away.' },
  { n: '2', title: 'Pick a problem or pattern', body: 'Filter by difficulty and company for coding, or start with pattern 1 for aptitude.' },
  { n: '3', title: 'Track real progress', body: 'Streaks, pattern completion, and acceptance rate — always visible, never guessed at.' },
];

const WITHOUT = [
  'A different tab for coding, aptitude, and company-specific questions',
  'No idea which topics you\u2019ve actually covered',
  'Generic questions not aligned to how placements test you',
];

const WITH = [
  'Coding and aptitude prep in one dashboard',
  'Pattern-wise progress you can see at a glance',
  'TCS NQT-style aptitude tests, timed the way the real one is',
];

// Logo-badge style: initials in a colored rounded square + company name.
// This reads visually as a "logo wall" without reproducing any real
// trademarked mark — colors are drawn from our own palette tokens, not
// copied from any company's actual brand colors.
const BADGE_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#0EA5E9'];
const COMPANIES = [
  'TCS', 'Infosys', 'Wipro', 'Accenture', 'Cognizant', 'Capgemini',
  'HCL Tech', 'Tech Mahindra', 'IBM', 'Amazon', 'Deloitte', 'LTI Mindtree',
].map((name, i) => ({
  name,
  initials: name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase(),
  color: BADGE_COLORS[i % BADGE_COLORS.length],
}));

// --- Scroll-reveal: a small IntersectionObserver hook instead of pulling
// in an animation library — this project's dependency list stays lean,
// and a one-time fade/slide-up is all this page needs.
function useReveal(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return [ref, visible];
}

function Reveal({ children, delay = 0, sx }) {
  const [ref, visible] = useReveal();
  return (
    <Box
      ref={ref}
      sx={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(28px)',
        transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}

// --- Counts up from 0 to `target` once the element scrolls into view.
// Plain requestAnimationFrame, no library — same reasoning as useReveal.
function useCountUp(target, duration = 1200) {
  const [ref, visible] = useReveal(0.4);
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!visible) return undefined;
    let raf;
    const start = performance.now();
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - (1 - progress) * (1 - progress); // ease-out
      setValue(Math.round(target * eased));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [visible, target, duration]);

  return [ref, value];
}

function NavBar() {
  const navigate = useNavigate();
  return (
    <Box
      component="header"
      sx={{
        borderBottom: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}
    >
      <Container maxWidth="lg">
        <Stack
          direction="row"
          sx={{ height: 64, width: '100%', alignItems: 'center', justifyContent: 'space-between' }}
        >
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            Jeet<Box component="span" sx={{ color: 'primary.main' }}>Code</Box>
          </Typography>
          <Stack direction="row" spacing={1.5}>
            <Button color="inherit" onClick={() => navigate('/login')}>
              Sign In
            </Button>
            <Button variant="contained" disableElevation onClick={() => navigate('/signup')} sx={{ fontWeight: 700 }}>
              Sign Up
            </Button>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}

// --- Hero visual: a browser-chrome-framed mockup of the actual product
// (dashboard-style problem list + aptitude progress), the way LeetCode/
// HackerRank show real UI on their homepages rather than abstract art.
// Everything here is built from MUI primitives — no screenshot, no
// third-party asset — so there's nothing to keep in sync with real
// screenshots and nothing borrowed from anywhere else.
function ProductPreview() {
  const rows = [
    { title: 'Two Sum', diff: 'Easy', diffColor: 'success', solved: true },
    { title: 'Longest Substring', diff: 'Medium', diffColor: 'warning', solved: true },
    { title: 'Merge K Lists', diff: 'Hard', diffColor: 'error', solved: false },
  ];

  return (
    <Box
      sx={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: { xs: 2, md: 0 },
      }}
    >
      {/* Soft gradient blob behind the frame, slow pulse */}
      <Box
        sx={{
          position: 'absolute',
          width: 360,
          height: 360,
          borderRadius: '50%',
          background: (t) =>
            t.palette.mode === 'dark'
              ? 'radial-gradient(circle, rgba(59,130,246,0.22), transparent 70%)'
              : 'radial-gradient(circle, rgba(59,130,246,0.16), transparent 70%)',
          animation: 'pulseBlob 6s ease-in-out infinite',
          '@keyframes pulseBlob': {
            '0%, 100%': { transform: 'scale(1)' },
            '50%': { transform: 'scale(1.1)' },
          },
        }}
      />

      {/* Browser-chrome frame, gentle float */}
      <Paper
        elevation={0}
        variant="outlined"
        sx={{
          position: 'relative',
          width: '100%',
          maxWidth: 420,
          borderRadius: 3,
          overflow: 'hidden',
          bgcolor: 'background.paper',
          boxShadow: '0 24px 48px -16px rgba(15,23,42,0.22)',
          animation: 'floatFrame 6s ease-in-out infinite',
          '@keyframes floatFrame': {
            '0%, 100%': { transform: 'translateY(0px)' },
            '50%': { transform: 'translateY(-10px)' },
          },
        }}
      >
        {/* Chrome bar */}
        <Box sx={{ px: 2, py: 1.25, bgcolor: 'action.hover', display: 'flex', alignItems: 'center', gap: 1 }}>
          <Stack direction="row" spacing={0.75}>
            <Box sx={{ width: 9, height: 9, borderRadius: '50%', bgcolor: 'error.main' }} />
            <Box sx={{ width: 9, height: 9, borderRadius: '50%', bgcolor: 'warning.main' }} />
            <Box sx={{ width: 9, height: 9, borderRadius: '50%', bgcolor: 'success.main' }} />
          </Stack>
          <Box
            sx={{
              ml: 1,
              flex: 1,
              bgcolor: 'background.paper',
              borderRadius: 5,
              px: 1.5,
              py: 0.4,
            }}
          >
            <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
              app.jeetcode.in/dashboard
            </Typography>
          </Box>
        </Box>

        {/* Mock dashboard content */}
        <Box sx={{ p: 2 }}>
          <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'block', mb: 1 }}>
            PROBLEMS
          </Typography>
          <Stack spacing={0.75} sx={{ mb: 2 }}>
            {rows.map((r) => (
              <Stack
                key={r.title}
                direction="row"
                sx={{ alignItems: 'center', justifyContent: 'space-between', px: 1.25, py: 0.75, borderRadius: 1.5, bgcolor: 'background.default' }}
              >
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  {r.solved ? (
                    <CheckCircleRoundedIcon sx={{ fontSize: 15, color: 'success.main' }} />
                  ) : (
                    <Box sx={{ width: 15, height: 15, borderRadius: '50%', border: '2px solid', borderColor: 'divider' }} />
                  )}
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>
                    {r.title}
                  </Typography>
                </Stack>
                <Chip label={r.diff} size="small" color={r.diffColor} variant="outlined" sx={{ height: 18, fontSize: '0.6rem' }} />
              </Stack>
            ))}
          </Stack>

          <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'block', mb: 1 }}>
            APTITUDE — PERCENTAGES
          </Typography>
          <Box sx={{ px: 1.25 }}>
            <Stack direction="row" sx={{ justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="caption" color="text.secondary">
                Best score
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'success.main' }}>
                92%
              </Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={92}
              color="success"
              sx={{ height: 6, borderRadius: 3 }}
            />
          </Box>
        </Box>
      </Paper>

      {/* Floating "unlocked" chip, offset + independent timing for parallax */}
      <Paper
        elevation={0}
        variant="outlined"
        sx={{
          position: 'absolute',
          bottom: { xs: -8, md: 12 },
          left: { xs: 4, md: -20 },
          px: 1.75,
          py: 1,
          borderRadius: 2.5,
          bgcolor: 'background.paper',
          boxShadow: '0 12px 28px -8px rgba(15,23,42,0.2)',
          animation: 'floatChip 4.5s ease-in-out infinite',
          animationDelay: '0.6s',
          '@keyframes floatChip': {
            '0%, 100%': { transform: 'translateY(0px)' },
            '50%': { transform: 'translateY(-10px)' },
          },
        }}
      >
        <Typography variant="caption" sx={{ fontWeight: 700 }}>
          🔓 Time & Work unlocked
        </Typography>
      </Paper>
    </Box>
  );
}

// --- Infinite scrolling logo-badge wall — three rows, alternating
// direction, different speeds, for a fuller "wall" feel than a single
// strip. Each row repeats its (short) list 4x, not 2x — with only ~4
// companies per row, doubling wasn't wide enough to fill the container,
// which left a visible gap and made the row look stuck to the left
// instead of scrolling edge-to-edge. Repeating 4x guarantees the strip is
// always wider than the viewport before the seamless -50% loop kicks in.
function LogoRow({ items, direction = 'left', duration = 26 }) {
  const tiled = [...items, ...items, ...items, ...items];
  const anim = direction === 'left' ? 'marqueeLeft' : 'marqueeRight';
  return (
    <Box
      sx={{
        display: 'flex',
        width: 'max-content',
        gap: 3,
        animation: `${anim} ${duration}s linear infinite`,
        '&:hover': { animationPlayState: 'paused' },
        '@keyframes marqueeLeft': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        '@keyframes marqueeRight': {
          '0%': { transform: 'translateX(-50%)' },
          '100%': { transform: 'translateX(0)' },
        },
      }}
    >
      {tiled.map((c, i) => (
        <Stack
          key={`${c.name}-${i}`}
          direction="row"
          spacing={1}
          sx={{ alignItems: 'center', whiteSpace: 'nowrap' }}
        >
          <Box
            sx={{
              width: 28,
              height: 28,
              borderRadius: 1.5,
              border: '1.5px solid',
              borderColor: c.color,
              color: c.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.65rem',
              fontWeight: 800,
              flexShrink: 0,
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
  // Split into three rows so no single strip carries the full list.
  const third = Math.ceil(COMPANIES.length / 3);
  const row1 = COMPANIES.slice(0, third);
  const row2 = COMPANIES.slice(third, third * 2);
  const row3 = COMPANIES.slice(third * 2);

  return (
    <Box sx={{ bgcolor: 'background.paper', borderTop: '1px solid', borderBottom: '1px solid', borderColor: 'divider' }}>
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mb: 2, fontWeight: 600 }}>
          PRACTICE FOR ROLES AT COMPANIES LIKE THESE
        </Typography>
        <Stack spacing={1.5}>
          {[
            { items: row1, direction: 'left', duration: 24 },
            { items: row2, direction: 'right', duration: 30 },
            { items: row3, direction: 'left', duration: 22 },
          ].map((row, i) => (
            <Box
              key={i}
              sx={{
                overflow: 'hidden',
                position: 'relative',
                maskImage: 'linear-gradient(90deg, transparent, black 8%, black 92%, transparent)',
                WebkitMaskImage: 'linear-gradient(90deg, transparent, black 8%, black 92%, transparent)',
              }}
            >
              <LogoRow items={row.items} direction={row.direction} duration={row.duration} />
            </Box>
          ))}
        </Stack>
      </Container>
    </Box>
  );
}

function StatItem({ target, suffix, label }) {
  const [ref, value] = useCountUp(target);
  return (
    <Box ref={ref} sx={{ textAlign: 'center' }}>
      <Typography variant="h4" sx={{ fontWeight: 800, color: 'primary.main' }}>
        {value}{suffix}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
    </Box>
  );
}

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', overflowX: 'hidden' }}>
      <NavBar />

      {/* Hero — two columns: text left, product-preview mockup right */}
      <Container maxWidth="lg" sx={{ pt: { xs: 6, md: 10 }, pb: { xs: 5, md: 6 } }}>
        <Grid container spacing={{ xs: 4, md: 6 }} sx={{ alignItems: 'center' }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Box
              sx={{
                textAlign: { xs: 'center', md: 'left' },
                animation: 'heroFadeIn 0.7s ease both',
                '@keyframes heroFadeIn': {
                  from: { opacity: 0, transform: 'translateY(16px)' },
                  to: { opacity: 1, transform: 'translateY(0)' },
                },
              }}
            >
              <Typography variant="overline" color="primary.main" sx={{ fontWeight: 700, letterSpacing: 1 }}>
                For students preparing for placements
              </Typography>
              <Typography
                variant="h3"
                sx={{ fontWeight: 800, mt: 1, mb: 2.5, letterSpacing: '-0.02em', fontSize: { xs: '2rem', md: '2.6rem' } }}
              >
                Master DSA and Aptitude — on one platform, in one flow
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.05rem', mb: 4, maxWidth: 480, mx: { xs: 'auto', md: 0 } }}>
                Stop juggling five different apps for placement prep. Solve real
                interview problems, work through pattern-wise TCS NQT aptitude
                tests, and see exactly where you stand — all in one place, built
                for how placements actually work.
              </Typography>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1.5}
                sx={{ justifyContent: { xs: 'center', md: 'flex-start' } }}
              >
                <Button
                  size="large"
                  variant="contained"
                  disableElevation
                  endIcon={<ArrowForwardRoundedIcon />}
                  onClick={() => navigate('/signup')}
                  sx={{
                    fontWeight: 700,
                    px: 3.5,
                    transition: 'transform 0.15s ease',
                    '&:hover': { transform: 'translateY(-2px)' },
                  }}
                >
                  Start Free
                </Button>
                <Button size="large" variant="outlined" onClick={() => navigate('/login')} sx={{ fontWeight: 700, px: 3.5 }}>
                  Log In
                </Button>
              </Stack>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <ProductPreview />
          </Grid>
        </Grid>
      </Container>

      <CompanyMarquee />

      {/* Problem / Agitate — now with a concrete visual comparison, not just a paragraph */}
      <Box sx={{ bgcolor: 'background.paper' }}>
        <Container maxWidth="md" sx={{ py: { xs: 6, md: 7 } }}>
          <Reveal>
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 4, textAlign: 'center' }}>
              Placement prep shouldn't feel this scattered
            </Typography>
          </Reveal>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Reveal delay={0}>
                <Paper
                  variant="outlined"
                  sx={{ p: 3, borderRadius: 3, height: '100%', borderLeft: '4px solid', borderLeftColor: 'error.main' }}
                >
                  <Typography variant="overline" sx={{ fontWeight: 700, color: 'error.main' }}>
                    Without JeetCode
                  </Typography>
                  <Stack spacing={1.25} sx={{ mt: 1.5 }}>
                    {WITHOUT.map((line) => (
                      <Typography key={line} variant="body2" color="text.secondary">
                        · {line}
                      </Typography>
                    ))}
                  </Stack>
                </Paper>
              </Reveal>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Reveal delay={120}>
                <Paper
                  variant="outlined"
                  sx={{ p: 3, borderRadius: 3, height: '100%', borderLeft: '4px solid', borderLeftColor: 'success.main' }}
                >
                  <Typography variant="overline" sx={{ fontWeight: 700, color: 'success.main' }}>
                    With JeetCode
                  </Typography>
                  <Stack spacing={1.25} sx={{ mt: 1.5 }}>
                    {WITH.map((line) => (
                      <Stack key={line} direction="row" spacing={1} sx={{ alignItems: 'flex-start' }}>
                        <CheckCircleRoundedIcon sx={{ fontSize: 16, color: 'success.main', mt: 0.3 }} />
                        <Typography variant="body2" color="text.secondary">
                          {line}
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>
                </Paper>
              </Reveal>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* How it works — 3 steps */}
      <Container maxWidth="lg" sx={{ py: { xs: 7, md: 8 } }}>
        <Reveal>
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 5, textAlign: 'center' }}>
            Get started in three steps
          </Typography>
        </Reveal>

        <Box sx={{ position: 'relative' }}>
          {/* Connecting line, desktop only */}
          <Box
            sx={{
              display: { xs: 'none', md: 'block' },
              position: 'absolute',
              top: 22,
              left: '16.5%',
              right: '16.5%',
              height: '2px',
              bgcolor: 'divider',
            }}
          />
          <Grid container spacing={4}>
            {STEPS.map((s, i) => (
              <Grid size={{ xs: 12, md: 4 }} key={s.n}>
                <Reveal delay={i * 140}>
                  <Box sx={{ textAlign: 'center', px: 1 }}>
                    <Box
                      sx={{
                        position: 'relative',
                        width: 44,
                        height: 44,
                        mx: 'auto',
                        mb: 2,
                        borderRadius: '50%',
                        bgcolor: 'primary.main',
                        color: 'primary.contrastText',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        boxShadow: '0 0 0 6px',
                        borderColor: 'background.default',
                      }}
                    >
                      {s.n}
                    </Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>
                      {s.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {s.body}
                    </Typography>
                  </Box>
                </Reveal>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>

      {/* Solve — 3 pillars */}
      <Box sx={{ bgcolor: 'background.paper' }}>
        <Container maxWidth="lg" sx={{ py: { xs: 7, md: 9 } }}>
          <Reveal>
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 1, textAlign: 'center' }}>
              Everything in one place, nothing extra
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mb: 5 }}>
              Built around how placement prep actually works, not around what looks impressive on a landing page.
            </Typography>
          </Reveal>

          <Grid container spacing={3}>
            {PILLARS.map(({ icon: Icon, title, body }, i) => (
              <Grid size={{ xs: 12, md: 4 }} key={title}>
                <Reveal delay={i * 120}>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 3.5,
                      borderRadius: 3,
                      height: '100%',
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                      '&:hover': { transform: 'translateY(-6px)', boxShadow: 6 },
                    }}
                  >
                    <Box
                      sx={{
                        width: 44,
                        height: 44,
                        borderRadius: 2,
                        bgcolor: 'primary.main',
                        color: 'primary.contrastText',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 2,
                      }}
                    >
                      <Icon />
                    </Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                      {title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {body}
                    </Typography>
                  </Paper>
                </Reveal>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Stats — real numbers, count-up on scroll, no exaggeration */}
      <Box sx={{ borderTop: '1px solid', borderBottom: '1px solid', borderColor: 'divider' }}>
        <Container maxWidth="md" sx={{ py: { xs: 5, md: 6 } }}>
          <Grid container spacing={3}>
            {STATS.map((s) => (
              <Grid size={{ xs: 6, md: 3 }} key={s.label}>
                <StatItem {...s} />
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Founder note — trust via authenticity, not manufactured testimonials */}
      <Container maxWidth="sm" sx={{ py: { xs: 7, md: 9 } }}>
        <Reveal>
          <Paper variant="outlined" sx={{ p: { xs: 3, md: 4 }, borderRadius: 3 }}>
            <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700 }}>
              Why I built this
            </Typography>
            <Typography variant="body1" sx={{ mt: 1.5, lineHeight: 1.8 }}>
              I've been through the same scattered prep everyone else has — one tab
              for problems, another for aptitude, a mental spreadsheet for what's
              actually covered. JeetCode is the tool I wish existed: one place,
              clear progress, no guesswork about what to do next.
            </Typography>
          </Paper>
        </Reveal>
      </Container>

      <Divider />

      {/* Final CTA */}
      <Container maxWidth="sm" sx={{ py: { xs: 7, md: 9 }, textAlign: 'center' }}>
        <Reveal>
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 1.5 }}>
            Ready to prep with a clear plan?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3.5 }}>
            Create your account and start with whichever pattern or problem set fits where you are today.
          </Typography>
          <Button
            size="large"
            variant="contained"
            disableElevation
            endIcon={<ArrowForwardRoundedIcon />}
            onClick={() => navigate('/signup')}
            sx={{
              fontWeight: 700,
              px: 4,
              transition: 'transform 0.15s ease',
              '&:hover': { transform: 'translateY(-2px)' },
            }}
          >
            Get Placement-Ready
          </Button>
        </Reveal>
      </Container>

      {/* Footer */}
      <Box component="footer" sx={{ borderTop: '1px solid', borderColor: 'divider', py: 3 }}>
        <Container maxWidth="lg">
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
            © {new Date().getFullYear()} JeetCode. Built for placement prep, one pattern at a time.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}
