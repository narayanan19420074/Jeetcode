import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Accordion, AccordionDetails, AccordionSummary, Box, Button, IconButton, Link, Stack, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CalculateRoundedIcon from '@mui/icons-material/CalculateRounded';
import BusinessRoundedIcon from '@mui/icons-material/BusinessRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded';
import LocalFireDepartmentRoundedIcon from '@mui/icons-material/LocalFireDepartmentRounded';
import WorkspacePremiumRoundedIcon from '@mui/icons-material/WorkspacePremiumRounded';
import BrandMark, { BRAND_ORANGE, BRAND_TEXT_LIGHT } from '../../components/BrandMark';
import { toggleThemeMode } from '../../app/uiSlice';
import { fmtDuration, fmtStart, inr, useCountdown } from '../contest/contestUtils';
import { tint } from '../dashboard/dashboardUtils';
import {
  LIBRARY_PALETTE,
  LIB_ACCENT,
  LIB_TRACKING,
  LibraryFont,
  libIconBtnSx,
  libPanelSx,
  libSectionTitleSx,
  libSmallBtnSx,
  libSolidBtnSx,
  libTintBtnSx,
  useLibraryPalette,
} from '../dashboard/components/libraryStyle';

// Phone landing page in the Library look (same cream surface, Roboto, 16px gutter, pill buttons,
// 20px panels and banners, tinted rounded icon tiles as the dashboard home).

const TONES = {
  aptitude: { color: '#F09A2E', bg: '#FFF2E3', Icon: CalculateRoundedIcon },
  coding: { color: '#3F8CE8', bg: '#EDF2F9', Icon: CodeRoundedIcon },
  prep: { color: '#0D9488', bg: '#E6F5F3', Icon: BusinessRoundedIcon },
  pair: { color: '#8B5CF6', bg: '#F1ECFD', Icon: GroupsRoundedIcon },
  track: { color: '#EF6C4D', bg: '#FDEEE9', Icon: LocalFireDepartmentRoundedIcon },
  good: { color: '#22A06B', bg: '#EAF6EE' },
};

const STAT_TONES = [TONES.coding, TONES.aptitude, TONES.good];
const SMALL_FEATURES = [
  { tone: TONES.prep, title: 'Company prep', body: 'Follow a track for TCS NQT and other companies, with a readiness score.' },
  { tone: TONES.pair, title: 'Practice with a friend', body: 'Share a link. Solve in one editor with chat, voice and video.' },
  { tone: TONES.track, title: 'Stay on track', body: 'Daily streaks, a leaderboard and a dashboard that shows your next step.' },
];

const CONTEST_GRADIENT = 'linear-gradient(135deg,#D9480F,#7C2D12)';
const FINAL_GRADIENT = 'linear-gradient(135deg,#7E3FA8,#4A1F8C)';
const pad = (n) => String(n).padStart(2, '0');

function Tile({ tone, size = 48, children }) {
  const dark = useTheme().palette.mode === 'dark';
  const { Icon, color, bg } = tone;
  return (
    <Box aria-hidden sx={{ width: size, height: size, flex: 'none', borderRadius: '14px', display: 'grid', placeItems: 'center', color, bgcolor: dark ? tint(color, 16) : bg }}>
      {children ?? <Icon sx={{ fontSize: 26 }} />}
    </Box>
  );
}

function Sub({ children, sx }) {
  const pal = useLibraryPalette();
  return <Typography sx={{ fontSize: 16, lineHeight: '24px', letterSpacing: LIB_TRACKING, color: pal.muted, ...sx }}>{children}</Typography>;
}

// Row like the dashboard company rows: 48px tile, title, muted line, divider underneath.
function InfoRow({ lead, title, body }) {
  const pal = useLibraryPalette();
  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: '12px', mb: '5px' }}>
      {lead}
      <Box sx={{ flex: 1, minWidth: 0, pb: '12px', borderBottom: `1px solid ${pal.divider}` }}>
        <Typography sx={{ fontSize: 16, lineHeight: '24px', fontWeight: 500, letterSpacing: LIB_TRACKING }}>{title}</Typography>
        <Typography sx={{ fontSize: 14, lineHeight: '20px', letterSpacing: LIB_TRACKING, color: pal.muted }}>{body}</Typography>
      </Box>
    </Box>
  );
}

function FeaturePanel({ tone, title, body, points, cta, to }) {
  const pal = useLibraryPalette();
  return (
    <Box sx={{ ...libPanelSx, p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Tile tone={tone} />
        <Box sx={{ minWidth: 0 }}>
          <Typography component="h3" sx={{ fontSize: 18, lineHeight: '24px', fontWeight: 700 }}>{title}</Typography>
          <Typography sx={{ fontSize: 14, lineHeight: '20px', letterSpacing: LIB_TRACKING, color: pal.muted }}>{body}</Typography>
        </Box>
      </Box>
      <Stack spacing={1} sx={{ mt: 2 }}>
        {points.map((p) => (
          <Box key={p} sx={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            <CheckRoundedIcon aria-hidden sx={{ fontSize: 20, mt: '2px', color: TONES.good.color }} />
            <Typography sx={{ fontSize: 16, lineHeight: '24px', letterSpacing: LIB_TRACKING }}>{p}</Typography>
          </Box>
        ))}
      </Stack>
      <Button component={RouterLink} to={to} sx={{ ...libTintBtnSx, ...libSmallBtnSx, mt: 2, bgcolor: 'var(--lib-bg)', '&:hover': { bgcolor: 'var(--lib-bg)', filter: 'brightness(0.97)' } }}>
        {cta}
      </Button>
    </Box>
  );
}

function PlanPanel({ name, price, note, points, cta, onCta, primary = false, badge, footnote }) {
  const pal = useLibraryPalette();
  return (
    <Box sx={{ ...libPanelSx, p: 2.5, ...(primary && { border: `2px solid ${LIB_ACCENT}` }) }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, minHeight: 28 }}>
        <Typography component="h3" sx={{ fontSize: 18, lineHeight: '24px', fontWeight: 700 }}>{name}</Typography>
        {badge && (
          <Box sx={{ px: '12px', height: 28, display: 'flex', alignItems: 'center', borderRadius: 999, bgcolor: LIB_ACCENT, color: '#fff', fontSize: 14, letterSpacing: LIB_TRACKING, whiteSpace: 'nowrap' }}>
            {badge}
          </Box>
        )}
      </Box>
      <Typography sx={{ mt: 1, fontSize: 36, lineHeight: '44px', fontWeight: 700, letterSpacing: '-0.02em' }}>{price}</Typography>
      <Sub sx={{ fontSize: 15, lineHeight: '22px' }}>{note}</Sub>
      <Stack spacing={1.25} sx={{ my: 2.5 }}>
        {points.map((p) => (
          <Box key={p} sx={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            <CheckCircleRoundedIcon aria-hidden sx={{ fontSize: 20, mt: '2px', color: primary ? LIB_ACCENT : TONES.good.color }} />
            <Typography sx={{ fontSize: 16, lineHeight: '24px', letterSpacing: LIB_TRACKING }}>{p}</Typography>
          </Box>
        ))}
      </Stack>
      <Button fullWidth onClick={onCta} sx={primary ? libSolidBtnSx : { ...libTintBtnSx, bgcolor: 'var(--lib-bg)', '&:hover': { bgcolor: 'var(--lib-bg)', filter: 'brightness(0.97)' } }}>
        {cta}
      </Button>
      {footnote && <Typography sx={{ mt: 1.5, textAlign: 'center', fontSize: 14, lineHeight: '20px', letterSpacing: LIB_TRACKING, color: pal.muted }}>{footnote}</Typography>}
    </Box>
  );
}

function Clock({ startsAt, serverTime }) {
  const { d, h, m, s } = useCountdown(startsAt, serverTime);
  return (
    <Box role="timer" aria-label={`Contest starts in ${d} days ${h} hours ${m} minutes`} sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', mt: 1 }}>
      {[[d, 'days'], [h, 'hours'], [m, 'min'], [s, 'sec']].map(([v, label]) => (
        <Box key={label} sx={{ py: 1, borderRadius: '12px', textAlign: 'center', bgcolor: 'rgba(255,255,255,0.18)' }}>
          <Typography sx={{ fontSize: 24, lineHeight: '28px', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{pad(v)}</Typography>
          <Typography sx={{ fontSize: 13, lineHeight: '16px', letterSpacing: LIB_TRACKING }}>{label}</Typography>
        </Box>
      ))}
    </Box>
  );
}

const whiteBtnSx = (color) => ({ ...libSolidBtnSx, bgcolor: '#fff', color, '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' } });
const glassBtnSx = { ...libTintBtnSx, bgcolor: 'rgba(255,255,255,0.18)', color: '#fff', '&:hover': { bgcolor: 'rgba(255,255,255,0.26)' } };

function ContestBanner({ contest, onOpen }) {
  const live = contest.status === 'live';
  const facts = [`${contest.problemCount} ${contest.difficulty.toLowerCase()} problems`, fmtDuration(contest.durationMinutes), 'No AI, no outside help'];
  return (
    <Box sx={{ borderRadius: '20px', p: 2.5, color: '#fff', background: CONTEST_GRADIENT }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Box aria-hidden sx={{ width: 44, height: 44, flex: 'none', borderRadius: '50%', display: 'grid', placeItems: 'center', border: '4px solid rgba(255,255,255,0.55)', background: 'linear-gradient(160deg, rgba(255,255,255,0.25), rgba(255,255,255,0.05))' }}>
          <EmojiEventsRoundedIcon sx={{ fontSize: 22 }} />
        </Box>
        <Typography noWrap sx={{ fontSize: 16, lineHeight: '24px', fontWeight: 500, letterSpacing: LIB_TRACKING }}>{contest.title}</Typography>
      </Box>
      <Typography component="h2" sx={{ mt: 2, fontSize: 40, lineHeight: '44px', fontWeight: 700, letterSpacing: '-0.02em' }}>{inr(contest.prizePool)}</Typography>
      <Typography sx={{ mt: 0.5, fontSize: 17, lineHeight: '24px', letterSpacing: LIB_TRACKING }}>for the students who solve it on their own.</Typography>
      <Typography sx={{ mt: 1.5, fontSize: 15, lineHeight: '22px', letterSpacing: LIB_TRACKING }}>
        One contest, one leaderboard, zero shortcuts. Solutions are checked, and anyone caught using AI is disqualified and loses the prize.
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
        {facts.map((f) => (
          <Box key={f} sx={{ px: '14px', height: 34, display: 'flex', alignItems: 'center', borderRadius: 999, fontSize: 15, letterSpacing: LIB_TRACKING, bgcolor: 'rgba(255,255,255,0.18)' }}>{f}</Box>
        ))}
      </Box>
      {live ? (
        <Typography sx={{ mt: 2.5, fontSize: 20, lineHeight: '28px', fontWeight: 700 }}>The contest is live now.</Typography>
      ) : (
        <Box sx={{ mt: 2.5 }}>
          <Typography sx={{ fontSize: 15, lineHeight: '22px', letterSpacing: LIB_TRACKING }}>Starts {fmtStart(contest.startsAt)}</Typography>
          <Clock startsAt={contest.startsAt} serverTime={contest.serverTime} />
        </Box>
      )}
      <Stack spacing={1.5} sx={{ mt: 2.5 }}>
        <Button fullWidth onClick={onOpen} sx={whiteBtnSx('#7C2D12')}>{live ? 'Enter the contest' : 'Apply for the contest'}</Button>
        <Button fullWidth onClick={onOpen} sx={glassBtnSx}>Read the rules</Button>
      </Stack>
      {contest.applicants >= 10 && <Typography sx={{ mt: 1.5, fontSize: 14, lineHeight: '20px', letterSpacing: LIB_TRACKING }}>{contest.applicants} students have already applied.</Typography>}
    </Box>
  );
}

function FooterCol({ title, links }) {
  const pal = useLibraryPalette();
  return (
    <Box>
      <Typography sx={{ fontSize: 15, lineHeight: '24px', fontWeight: 700, mb: 0.5 }}>{title}</Typography>
      {links.map(([label, onClick]) => (
        <Link key={label} component="button" type="button" onClick={onClick} underline="hover" sx={{ display: 'flex', alignItems: 'center', minHeight: 36, font: 'inherit', fontSize: 15, letterSpacing: LIB_TRACKING, color: pal.muted, textAlign: 'left' }}>
          {label}
        </Link>
      ))}
    </Box>
  );
}

export default function MobileLanding({ authed, offerEnds, contest, faq, startLabel, goStart, go, heroCtaRef, finalCtaRef, showSticky, data }) {
  const pal = useLibraryPalette();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const mode = useSelector((s) => s.ui.mode);
  const { STATS, STEPS, FREE_FEATURES, PRO_FEATURES, PRICE_MONTH, PRICE_YEAR } = data;
  const openContest = contest && contest.status !== 'ended' ? contest : null;

  return (
    <Box id="top" sx={(t) => ({ minHeight: '100dvh', overflowX: 'hidden', bgcolor: t.palette.mode === 'light' ? LIBRARY_PALETTE.light.bg : 'background.default' })}>
      <LibraryFont sx={{ px: 2, maxWidth: 640, mx: 'auto' }}>
        {/* Top bar */}
        <Box sx={{ pt: 'calc(8px + env(safe-area-inset-top))', minHeight: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box component="a" href="#top" aria-label="JeetCode home" sx={{ display: 'flex', alignItems: 'center', gap: '10px', color: pal.text, textDecoration: 'none' }}>
            <BrandMark size={36} />
            <Typography sx={{ fontSize: 22, lineHeight: '28px', fontWeight: 700, letterSpacing: '-0.01em' }}>
              Jeet<Box component="span" sx={{ color: mode === 'dark' ? BRAND_ORANGE : BRAND_TEXT_LIGHT }}>Code</Box>
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton aria-label={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'} onClick={() => dispatch(toggleThemeMode())} sx={libIconBtnSx}>
              {mode === 'dark' ? <LightModeRoundedIcon /> : <DarkModeRoundedIcon />}
            </IconButton>
            {!authed && (
              <Button onClick={go('/login')} sx={{ ...libTintBtnSx, ...libSmallBtnSx, height: 40 }}>
                Log in
              </Button>
            )}
          </Box>
        </Box>

        <Stack spacing={4} sx={{ mt: 2 }}>
          {/* Hero */}
          <Box sx={{ textAlign: 'center' }}>
            {offerEnds && (
              <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75, px: '14px', height: 34, mb: 2, borderRadius: 999, bgcolor: 'var(--lib-chip)', color: 'var(--lib-chip-text)', fontSize: 15, letterSpacing: LIB_TRACKING }}>
                <WorkspacePremiumRoundedIcon aria-hidden sx={{ fontSize: 20, color: TONES.aptitude.color }} />
                Launch offer: Pro is free until {offerEnds}
              </Box>
            )}
            <Typography component="h1" sx={{ fontSize: 30, lineHeight: '36px', fontWeight: 700, letterSpacing: '-0.01em', textWrap: 'balance' }}>
              Placement prep for coding and aptitude.
            </Typography>
            <Sub sx={{ mt: 1.5, fontSize: 17 }}>Practice aptitude and coding problems, take timed tests, and see your progress. All in one place.</Sub>
            <Stack spacing={1.5} sx={{ mt: 3 }}>
              <Button ref={heroCtaRef} fullWidth onClick={goStart} sx={libSolidBtnSx}>{startLabel}</Button>
              <Button component="a" href="#features" fullWidth sx={libTintBtnSx}>See what&apos;s inside</Button>
            </Stack>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '11px', mt: 3, textAlign: 'left' }}>
              {STATS.map((x, i) => (
                <Box key={x.label} sx={(t) => ({ minHeight: 88, p: '12px', borderRadius: '16px', border: `1.5px solid ${pal.border}`, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', bgcolor: t.palette.mode === 'dark' ? tint(STAT_TONES[i].color, 16) : STAT_TONES[i].bg })}>
                  <Typography sx={{ fontSize: 22, lineHeight: '28px', fontWeight: 700, color: STAT_TONES[i].color }}>{x.value}</Typography>
                  <Typography sx={{ fontSize: 13, lineHeight: '16px', letterSpacing: LIB_TRACKING }}>{x.label}</Typography>
                </Box>
              ))}
            </Box>
          </Box>

          {/* What you get */}
          <Stack id="features" spacing={1.5} sx={{ scrollMarginTop: 16 }}>
            <Typography component="h2" sx={libSectionTitleSx}>Everything for your placement test</Typography>
            <Sub>Aptitude and coding are the two things placement tests ask for. Practice both here.</Sub>
            <FeaturePanel tone={TONES.aptitude} title="Aptitude" body="Learn it, practice it, then test yourself against the clock." points={['32 patterns, 3,200 questions', 'A short lesson before every topic', 'Timed tests that unlock the next level']} cta="Try aptitude" to="/aptitude" />
            <FeaturePanel tone={TONES.coding} title="Coding" body="Write code in the browser and see the result straight away." points={['290+ problems from Easy to Hard', 'JavaScript, Python and C++', 'Company tags, so you know what gets asked']} cta="Try a problem" to="/problems" />
            <Box sx={{ pt: 1 }}>
              {SMALL_FEATURES.map((f) => (
                <InfoRow key={f.title} lead={<Tile tone={f.tone} />} title={f.title} body={f.body} />
              ))}
            </Box>
          </Stack>

          {/* How it works */}
          <Stack id="how-it-works" spacing={1.5} sx={{ scrollMarginTop: 16 }}>
            <Typography component="h2" sx={libSectionTitleSx}>Start in two minutes</Typography>
            <Box>
              {STEPS.map((st, i) => (
                <InfoRow
                  key={st.title}
                  lead={
                    <Box aria-hidden sx={{ width: 48, height: 48, flex: 'none', borderRadius: '14px', display: 'grid', placeItems: 'center', bgcolor: 'var(--lib-chip)', color: LIB_ACCENT, fontSize: 20, fontWeight: 700 }}>
                      {i + 1}
                    </Box>
                  }
                  title={st.title}
                  body={st.body}
                />
              ))}
            </Box>
            <Button fullWidth onClick={goStart} sx={libSolidBtnSx}>{startLabel}</Button>
          </Stack>

          {/* Contest: only while one is open */}
          {openContest && <ContestBanner contest={openContest} onOpen={go('/contest')} />}

          {/* Pricing */}
          <Stack id="pricing" spacing={1.5} sx={{ scrollMarginTop: 16 }}>
            <Typography component="h2" sx={libSectionTitleSx}>Start free. Upgrade only if you want to.</Typography>
            <Sub>The free plan has everything to begin. Pro adds the extras.</Sub>
            <PlanPanel name="Free" price="₹0" note="Everything you need to begin." points={FREE_FEATURES} cta={startLabel} onCta={goStart} />
            <PlanPanel
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
          </Stack>

          {/* Why it exists */}
          <Box sx={{ ...libPanelSx, p: 2.5 }}>
            <Sub sx={{ fontSize: 15, lineHeight: '22px', fontWeight: 500 }}>Why I built this</Sub>
            <Typography sx={{ mt: 1, fontSize: 20, lineHeight: '28px', fontWeight: 500, textWrap: 'pretty' }}>
              I lived the scattered prep: tabs everywhere, no clear next step, nobody to practice with. JeetCode is the tool I wish I had.
            </Typography>
          </Box>

          {/* FAQ */}
          <Stack spacing={1}>
            <Typography component="h2" sx={libSectionTitleSx}>Questions? Answered.</Typography>
            <Box sx={{ borderTop: `1px solid ${pal.divider}` }}>
              {faq.map((f) => (
                <Accordion key={f.q} disableGutters elevation={0} square sx={{ bgcolor: 'transparent', borderBottom: `1px solid ${pal.divider}`, '&:before': { display: 'none' } }}>
                  <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />} sx={{ px: 0, minHeight: 56, '& .MuiAccordionSummary-content': { my: 1.5 } }}>
                    <Typography sx={{ fontSize: 16, lineHeight: '24px', fontWeight: 500, letterSpacing: LIB_TRACKING }}>{f.q}</Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ px: 0, pt: 0, pb: 2 }}>
                    <Sub>{f.a}</Sub>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>
          </Stack>

          {/* Final CTA */}
          <Box sx={{ borderRadius: '20px', p: 3, textAlign: 'center', color: '#fff', background: FINAL_GRADIENT }}>
            <Typography component="h2" sx={{ fontSize: 26, lineHeight: '32px', fontWeight: 700, textWrap: 'balance' }}>Your first question is two minutes away.</Typography>
            <Typography sx={{ mt: 1, fontSize: 17, lineHeight: '24px', letterSpacing: LIB_TRACKING }}>Create your free account and solve your first question.</Typography>
            <Stack spacing={1.5} sx={{ mt: 3 }}>
              <Button ref={finalCtaRef} fullWidth onClick={goStart} sx={whiteBtnSx('#4A1F8C')}>{startLabel}</Button>
              <Button fullWidth onClick={() => navigate('/pair')} sx={glassBtnSx}>Try a pair room</Button>
            </Stack>
          </Box>

          {/* Footer */}
          <Box component="footer" sx={{ borderTop: `1px solid ${pal.divider}`, pt: 3, pb: 'calc(96px + env(safe-area-inset-bottom))' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <BrandMark size={32} />
              <Typography sx={{ fontSize: 20, lineHeight: '28px', fontWeight: 700, letterSpacing: '-0.01em' }}>
                Jeet<Box component="span" sx={{ color: mode === 'dark' ? BRAND_ORANGE : BRAND_TEXT_LIGHT }}>Code</Box>
              </Typography>
            </Box>
            <Sub sx={{ mt: 1, fontSize: 15, lineHeight: '22px' }}>Coding, aptitude and company prep for placement season, in one place.</Sub>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3, mt: 3 }}>
              <FooterCol title="Practice" links={[['Problems', go('/problems')], ['Aptitude', go('/aptitude')], ['Company prep', go('/prep')], ['Visualizer', go('/visualizer')]]} />
              <FooterCol title="Together" links={[['Pair rooms', go('/pair')], ['Contest', go('/contest')], ['Pricing', go('/pricing')]]} />
              <FooterCol title="Account" links={authed ? [['Dashboard', go('/dashboard')]] : [['Log in', go('/login')], ['Sign up', go('/signup')]]} />
            </Box>
            <Typography sx={{ mt: 3, fontSize: 13, lineHeight: '20px', letterSpacing: LIB_TRACKING, color: pal.muted }}>
              Company names and marks belong to their owners. They appear only to show which company a question is tagged to, and do not imply any affiliation or endorsement.
            </Typography>
            <Typography sx={{ mt: 1, fontSize: 13, lineHeight: '20px', letterSpacing: LIB_TRACKING, color: pal.muted }}>© {new Date().getFullYear()} JeetCode</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', columnGap: 2, mt: 0.5 }}>
              {[['Privacy Policy', '/privacy'], ['Terms of Service', '/terms'], ['Refund & Cancellation', '/refund'], ['Help & Support', '/help']].map(([label, path]) => (
                <Link key={path} component="button" type="button" onClick={go(path)} underline="hover" sx={{ minHeight: 36, font: 'inherit', fontSize: 13, letterSpacing: LIB_TRACKING, color: pal.muted }}>
                  {label}
                </Link>
              ))}
            </Box>
          </Box>
        </Stack>
      </LibraryFont>

      {/* Sticky CTA: visible while neither the hero nor the final button is on screen */}
      {showSticky && (
        <Box sx={{ position: 'fixed', left: 16, right: 16, bottom: 'calc(12px + env(safe-area-inset-bottom))', zIndex: 30, maxWidth: 608, mx: 'auto' }}>
          <LibraryFont>
            <Button fullWidth onClick={goStart} sx={{ ...libSolidBtnSx, height: 56 }}>{startLabel}</Button>
          </LibraryFont>
        </Box>
      )}
    </Box>
  );
}
