import { Box, Button, Container, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import { useNavigate } from 'react-router-dom';
import { useCountdown, inr, fmtStart, fmtDuration } from '../contest/contestUtils';
import { COLOR_PALETTE, FONTS, FONT_WEIGHTS, FONT_SIZES, LETTER_SPACING, LINE_HEIGHTS, RADII_PX, SIZES, TEXT_MEASURE } from '../../app/design/designTokens';
import { anchorOffset, hairline } from './homeStyles';

// Dark, fixed palette on purpose: this is the one loud moment on the page, so
// it keeps its own colours in both light and dark mode. All numbers come from
// the server's contest config (single source of truth), never hard-coded here.
const INK = COLOR_PALETTE.gray[900];
const GOLD = COLOR_PALETTE.amber[400];
const onInk = (opacity) => alpha(COLOR_PALETTE.white, opacity);
const padTwoDigits = (value) => String(value).padStart(2, '0');

const glowSx = {
  position: 'absolute',
  inset: 0,
  background: `radial-gradient(60% 80% at 85% 0%, ${alpha(GOLD, 0.18)}, transparent 70%), radial-gradient(50% 70% at 0% 100%, ${alpha(COLOR_PALETTE.indigo[500], 0.22)}, transparent 70%)`,
};

function Clock({ startsAt, serverTime }) {
  const { d, h, m, s } = useCountdown(startsAt, serverTime);
  return (
    <Stack direction="row" spacing={{ xs: 1.5, sm: 2.5 }} role="timer" aria-label={`Contest starts in ${d} days ${h} hours ${m} minutes`}>
      {[[d, 'days'], [h, 'hours'], [m, 'min'], [s, 'sec']].map(([value, label]) => (
        <Box key={label} sx={{ minWidth: SIZES.countdownCell }}>
          <Typography sx={{ fontFamily: FONTS.mono, fontWeight: FONT_WEIGHTS.semibold, fontSize: { xs: FONT_SIZES.hero, sm: FONT_SIZES.heroLg }, lineHeight: 1, color: COLOR_PALETTE.white, fontVariantNumeric: 'tabular-nums' }}>
            {padTwoDigits(value)}
          </Typography>
          <Typography sx={{ mt: 0.5, fontSize: FONT_SIZES.caption, color: onInk(0.65), fontWeight: FONT_WEIGHTS.semibold }}>{label}</Typography>
        </Box>
      ))}
    </Stack>
  );
}

function ContestFacts({ contest }) {
  const facts = [`${contest.problemCount} ${contest.difficulty.toLowerCase()} problems`, fmtDuration(contest.durationMinutes), 'No AI, no outside help'];
  return (
    <Stack direction="row" useFlexGap sx={{ flexWrap: 'wrap', gap: 1, mt: 3 }}>
      {facts.map((fact) => (
        <Box key={fact} sx={{ px: 1.5, py: 0.5, borderRadius: RADII_PX.pill, fontSize: FONT_SIZES.body, fontWeight: FONT_WEIGHTS.semibold, border: hairline, borderColor: onInk(0.22), bgcolor: onInk(0.06) }}>
          {fact}
        </Box>
      ))}
    </Stack>
  );
}

function PrizeHeadline({ contest }) {
  return (
    <Box>
      <Typography component="h2" sx={{ fontWeight: FONT_WEIGHTS.bold, letterSpacing: LETTER_SPACING.display, lineHeight: 0.98, fontSize: { xs: FONT_SIZES.jumbo, sm: FONT_SIZES.heroDisplay, md: FONT_SIZES.heroDisplayLg }, color: GOLD }}>
        {inr(contest.prizePool)}
      </Typography>
      <Typography sx={{ fontWeight: FONT_WEIGHTS.bold, letterSpacing: LETTER_SPACING.heading, fontSize: { xs: FONT_SIZES.display, md: FONT_SIZES.hero }, lineHeight: 1.15, mt: 1.5, maxWidth: TEXT_MEASURE.headline }}>
        for the students who solve it on their own.
      </Typography>
      <Typography sx={{ mt: 2, color: onInk(0.78), fontSize: FONT_SIZES.title, maxWidth: TEXT_MEASURE.body, lineHeight: LINE_HEIGHTS.relaxed }}>
        One contest, one leaderboard, zero shortcuts. Solutions are checked, and anyone caught using AI is disqualified and loses the prize.
      </Typography>
      <ContestFacts contest={contest} />
    </Box>
  );
}

function ContestActions({ live, onOpen }) {
  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mt: 4 }}>
      <Button size="large" variant="contained" disableElevation onClick={onOpen} sx={{ bgcolor: GOLD, color: INK, fontWeight: FONT_WEIGHTS.bold, px: 3.5, py: 1.5, whiteSpace: 'nowrap', '&:hover': { bgcolor: COLOR_PALETTE.amber[300] } }}>
        {live ? 'Enter the contest' : 'Apply for the contest'}
      </Button>
      <Button size="large" variant="outlined" onClick={onOpen} sx={{ color: COLOR_PALETTE.white, borderColor: onInk(0.4), fontWeight: FONT_WEIGHTS.bold, px: 3, py: 1.5, whiteSpace: 'nowrap', '&:hover': { borderColor: COLOR_PALETTE.white, bgcolor: onInk(0.08) } }}>
        Read the rules
      </Button>
    </Stack>
  );
}

function ContestStatus({ contest, live, onOpen }) {
  return (
    <Box>
      {live ? (
        <Typography sx={{ fontWeight: FONT_WEIGHTS.bold, fontSize: FONT_SIZES.displayLg }}>The contest is live now.</Typography>
      ) : (
        <>
          <Typography sx={{ color: onInk(0.7), fontWeight: FONT_WEIGHTS.semibold, mb: 1.5 }}>Starts {fmtStart(contest.startsAt)}</Typography>
          <Clock startsAt={contest.startsAt} serverTime={contest.serverTime} />
        </>
      )}
      <ContestActions live={live} onOpen={onOpen} />
      {contest.applicants >= 10 && (
        <Typography sx={{ mt: 2, color: onInk(0.7), fontSize: FONT_SIZES.body }}>{contest.applicants} students have already applied.</Typography>
      )}
    </Box>
  );
}

export default function ContestBand({ contest }) {
  const navigate = useNavigate();
  if (!contest || contest.status === 'ended') return null;

  return (
    <Box id="contest" sx={{ bgcolor: INK, color: COLOR_PALETTE.white, position: 'relative', overflow: 'hidden', scrollMarginTop: anchorOffset }}>
      <Box aria-hidden="true" sx={glowSx} />
      <Container maxWidth="lg" sx={{ position: 'relative', py: { xs: 8, md: 11 } }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 2.5, color: GOLD }}>
          <EmojiEventsRoundedIcon />
          <Typography sx={{ fontWeight: FONT_WEIGHTS.bold }}>{contest.title}</Typography>
        </Stack>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1.25fr 1fr' }, gap: { xs: 5, md: 8 }, alignItems: 'end' }}>
          <PrizeHeadline contest={contest} />
          <ContestStatus contest={contest} live={contest.status === 'live'} onOpen={() => navigate('/contest')} />
        </Box>
      </Container>
    </Box>
  );
}
