import { Box, Button, Container, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import { useNavigate } from 'react-router-dom';
import { useCountdown, inr, fmtStart, fmtDuration } from '../contest/contestUtils';
import { DISPLAY_FONT, MONO_FONT } from './anim';
import { COLOR_PALETTE, FONT_WEIGHTS, FONT_SIZES, RADII_PX } from '../../app/design/designTokens';

// Dark, fixed palette on purpose: this is the one loud moment on the page, so
// it keeps its own colours in both light and dark mode. All numbers come from
// the server's contest config (single source of truth), never hard-coded here.
const INK = COLOR_PALETTE.gray[900];
const GOLD = COLOR_PALETTE.amber[400];
const pad = (n) => String(n).padStart(2, '0');

function Clock({ startsAt, serverTime }) {
  const { d, h, m, s } = useCountdown(startsAt, serverTime);
  return (
    <Stack direction="row" spacing={{ xs: 1.5, sm: 2.5 }} role="timer" aria-label={`Contest starts in ${d} days ${h} hours ${m} minutes`}>
      {[[d, 'days'], [h, 'hours'], [m, 'min'], [s, 'sec']].map(([v, label]) => (
        <Box key={label} sx={{ minWidth: 52 }}>
          <Typography sx={{ fontFamily: MONO_FONT, fontWeight: FONT_WEIGHTS.semibold, fontSize: { xs: FONT_SIZES.hero, sm: FONT_SIZES.heroLg }, lineHeight: 1, color: COLOR_PALETTE.white, fontVariantNumeric: 'tabular-nums' }}>
            {pad(v)}
          </Typography>
          <Typography sx={{ mt: 0.5, fontSize: FONT_SIZES.caption, color: alpha(COLOR_PALETTE.white, 0.65), fontWeight: FONT_WEIGHTS.semibold }}>{label}</Typography>
        </Box>
      ))}
    </Stack>
  );
}

export default function ContestBand({ contest }) {
  const navigate = useNavigate();
  if (!contest || contest.status === 'ended') return null;

  const live = contest.status === 'live';
  const facts = [
    `${contest.problemCount} ${contest.difficulty.toLowerCase()} problems`,
    fmtDuration(contest.durationMinutes),
    'No AI, no outside help',
  ];

  return (
    <Box id="contest" sx={{ bgcolor: INK, color: COLOR_PALETTE.white, position: 'relative', overflow: 'hidden', scrollMarginTop: 64 }}>
      <Box aria-hidden="true" sx={{ position: 'absolute', inset: 0, background: `radial-gradient(60% 80% at 85% 0%, ${alpha(GOLD, 0.18)}, transparent 70%), radial-gradient(50% 70% at 0% 100%, ${alpha(COLOR_PALETTE.indigo[500], 0.22)}, transparent 70%)` }} />
      <Container maxWidth="lg" sx={{ position: 'relative', py: { xs: 8, md: 11 } }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 2.5, color: GOLD }}>
          <EmojiEventsRoundedIcon />
          <Typography sx={{ fontWeight: FONT_WEIGHTS.bold }}>{contest.title}</Typography>
        </Stack>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1.25fr 1fr' }, gap: { xs: 5, md: 8 }, alignItems: 'end' }}>
          <Box>
            <Typography
              component="h2"
              sx={{ fontFamily: DISPLAY_FONT, fontWeight: FONT_WEIGHTS.bold, letterSpacing: '-0.035em', lineHeight: 0.98, fontSize: { xs: FONT_SIZES.jumbo, sm: FONT_SIZES.heroDisplay, md: FONT_SIZES.heroDisplayLg }, color: GOLD }}
            >
              {inr(contest.prizePool)}
            </Typography>
            <Typography sx={{ fontFamily: DISPLAY_FONT, fontWeight: FONT_WEIGHTS.bold, letterSpacing: '-0.02em', fontSize: { xs: FONT_SIZES.display, md: FONT_SIZES.hero }, lineHeight: 1.15, mt: 1.5, maxWidth: '22ch' }}>
              for the students who solve it on their own.
            </Typography>
            <Typography sx={{ mt: 2, color: alpha(COLOR_PALETTE.white, 0.78), fontSize: FONT_SIZES.title, maxWidth: '50ch', lineHeight: 1.6 }}>
              One contest, one leaderboard, zero shortcuts. Solutions are checked, and anyone caught using AI is disqualified and loses the prize.
            </Typography>
            <Stack direction="row" useFlexGap sx={{ flexWrap: 'wrap', gap: 1, mt: 3 }}>
              {facts.map((f) => (
                <Box key={f} sx={{ px: 1.5, py: 0.5, borderRadius: RADII_PX.pill, fontSize: FONT_SIZES.body, fontWeight: FONT_WEIGHTS.semibold, border: `1px solid ${alpha(COLOR_PALETTE.white, 0.22)}`, bgcolor: alpha(COLOR_PALETTE.white, 0.06) }}>
                  {f}
                </Box>
              ))}
            </Stack>
          </Box>
          <Box>
            {!live && (
              <>
                <Typography sx={{ color: alpha(COLOR_PALETTE.white, 0.7), fontWeight: FONT_WEIGHTS.semibold, mb: 1.5 }}>Starts {fmtStart(contest.startsAt)}</Typography>
                <Clock startsAt={contest.startsAt} serverTime={contest.serverTime} />
              </>
            )}
            {live && <Typography sx={{ fontFamily: DISPLAY_FONT, fontWeight: FONT_WEIGHTS.bold, fontSize: FONT_SIZES.displayLg }}>The contest is live now.</Typography>}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mt: 4 }}>
              <Button
                size="large"
                variant="contained"
                disableElevation
                onClick={() => navigate('/contest')}
                sx={{ bgcolor: GOLD, color: INK, fontWeight: FONT_WEIGHTS.bold, px: 3.5, py: 1.5, whiteSpace: 'nowrap', '&:hover': { bgcolor: COLOR_PALETTE.amber[300] } }}
              >
                {live ? 'Enter the contest' : 'Apply for the contest'}
              </Button>
              <Button
                size="large"
                variant="outlined"
                onClick={() => navigate('/contest')}
                sx={{ color: COLOR_PALETTE.white, borderColor: alpha(COLOR_PALETTE.white, 0.4), fontWeight: FONT_WEIGHTS.bold, px: 3, py: 1.5, whiteSpace: 'nowrap', '&:hover': { borderColor: COLOR_PALETTE.white, bgcolor: alpha(COLOR_PALETTE.white, 0.08) } }}
              >
                Read the rules
              </Button>
            </Stack>
            {contest.applicants >= 10 && (
              <Typography sx={{ mt: 2, color: alpha(COLOR_PALETTE.white, 0.7), fontSize: FONT_SIZES.body }}>{contest.applicants} students have already applied.</Typography>
            )}
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
