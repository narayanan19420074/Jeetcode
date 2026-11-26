import { Box, Button, ButtonBase, Stack, Typography } from '@mui/material';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import MyLocationRoundedIcon from '@mui/icons-material/MyLocationRounded';
import WorkspacePremiumRoundedIcon from '@mui/icons-material/WorkspacePremiumRounded';
import { tint } from '../../dashboard/dashboardUtils';
import { LIB_TRACKING, libTintBtnSx } from '../../dashboard/components/libraryStyle';
import { FONT_SIZES, FONT_WEIGHTS, MOTION, RADII_PX, SIZES } from '../../../app/design/designTokens';
import { tierFor } from '../tiers';
import { num } from './leaderboardConfig';

const bigNumberSx = { fontWeight: FONT_WEIGHTS.bold, fontSize: FONT_SIZES.displayLg, lineHeight: '34px', fontVariantNumeric: 'tabular-nums' };
const mutedLabelSx = { fontSize: FONT_SIZES.body, letterSpacing: LIB_TRACKING };

// Rank and points of the signed-in player; tapping them opens the player details.
function RankAndPoints({ me, onOpen }) {
  return (
    <ButtonBase
      onClick={onOpen}
      aria-label="Open your player details"
      sx={{ width: SIZES.fill, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5, fontFamily: 'inherit', color: 'inherit', textAlign: 'left' }}
    >
      <Box sx={{ minWidth: SIZES.flexShrinkMinWidth }}>
        <Typography color="var(--lib-muted)" sx={mutedLabelSx}>Your rank</Typography>
        <Typography sx={bigNumberSx}>#{num(me.rank)}</Typography>
      </Box>
      <Box sx={{ textAlign: 'right', minWidth: SIZES.flexShrinkMinWidth }}>
        <Typography color="var(--lib-muted)" sx={mutedLabelSx}>Points</Typography>
        <Typography sx={bigNumberSx}>{num(me.score)}</Typography>
      </Box>
      <ChevronRightRoundedIcon sx={{ color: 'var(--lib-muted)', flexShrink: 0 }} />
    </ButtonBase>
  );
}

// The player's tier and how far the next tier is.
function TierProgress({ score }) {
  const { tier, next, progress, toNext } = tierFor(score);
  const caption = next ? `${num(toNext)} points to ${next.name}` : 'Top level reached';
  return (
    <Box sx={{ mt: 1.5 }}>
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
        <Stack direction="row" sx={{ alignItems: 'center', gap: 0.5, color: tier.color, fontWeight: FONT_WEIGHTS.bold, fontSize: FONT_SIZES.bodyLg }}>
          <WorkspacePremiumRoundedIcon sx={{ fontSize: FONT_SIZES.subheading }} />
          {tier.name}
        </Stack>
        <Typography color="var(--lib-muted)" sx={{ fontSize: FONT_SIZES.body, fontVariantNumeric: 'tabular-nums' }}>{caption}</Typography>
      </Stack>
      <Box
        role="progressbar"
        aria-label={next ? `Progress to ${next.name}` : 'Top level reached'}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress}
        sx={{ mt: 1, height: SIZES.leaderboard.compactProgress, borderRadius: RADII_PX.pill, bgcolor: tint(tier.color, 20), overflow: 'hidden' }}
      >
        <Box sx={{ width: `${Math.max(progress, 3)}%`, height: SIZES.fill, borderRadius: RADII_PX.pill, bgcolor: tier.color, transition: `width ${MOTION.deliberate}ms` }} />
      </Box>
    </Box>
  );
}

// Your position at the top of the phone Leaderboard: rank, points, tier progress and a shortcut to your row.
export function MyRank({ me, canFind, onOpen, onFind }) {
  return (
    <Box sx={{ mt: 3, p: 2, borderRadius: RADII_PX.card, bgcolor: 'var(--lib-chip)', border: '1px solid var(--lib-border)' }}>
      <RankAndPoints me={me} onOpen={onOpen} />
      <TierProgress score={me.score} />
      {canFind && (
        <Button onClick={onFind} fullWidth disableElevation variant="contained" startIcon={<MyLocationRoundedIcon />} sx={{ ...libTintBtnSx, mt: 1.5, bgcolor: 'var(--lib-player)' }}>
          Find me in the list
        </Button>
      )}
    </Box>
  );
}
