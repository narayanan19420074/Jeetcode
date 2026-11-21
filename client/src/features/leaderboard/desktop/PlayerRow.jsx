import { Box, ButtonBase, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { LIB_ACCENT, LIB_TRACKING, useLibraryPalette } from '../../dashboard/components/libraryStyle';
import { FONT_SIZES, FONT_WEIGHTS, MOTION, SIZES } from '../../../app/design/designTokens';
import { tierFor } from '../tiers';
import { CountUp, YouChip, activeLabel } from '../lbShared';
import { MEDAL_INK, FOCUS_RING, TABULAR } from './lbLook';
import { PlayerAvatar, RankMove, RankTile, RecentCount, SolvedStats, StreakCount, TierDot } from './RowParts';

function PlayerIdentity({ row, isMe, tier }) {
  const pal = useLibraryPalette();
  return (
    <Box sx={{ minWidth: SIZES.flexShrinkMinWidth, flex: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, minWidth: SIZES.flexShrinkMinWidth }}>
        <Typography noWrap sx={{ minWidth: SIZES.flexShrinkMinWidth, fontSize: FONT_SIZES.title, fontWeight: FONT_WEIGHTS.medium, letterSpacing: LIB_TRACKING, lineHeight: 1.3 }}>{row.name}</Typography>
        {isMe && <YouChip />}
        <RankMove row={row} />
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: SIZES.flexShrinkMinWidth }}>
        <TierDot tier={tier} />
        <Typography noWrap variant="caption" sx={{ minWidth: SIZES.flexShrinkMinWidth, color: pal.muted }}>@{row.handle}</Typography>
        <StreakCount value={row.streak} />
      </Box>
    </Box>
  );
}

function PointsCell({ row, animated }) {
  const pal = useLibraryPalette();
  return (
    <Box sx={{ width: SIZES.leaderboard.pointsColumn, flexShrink: 0, textAlign: 'right' }}>
      <Typography sx={[{ fontSize: FONT_SIZES.subheading, fontWeight: FONT_WEIGHTS.bold, lineHeight: 1.2, color: MEDAL_INK[row.rank] || pal.text }, TABULAR]}>
        {animated ? <CountUp value={row.score} /> : row.score.toLocaleString()}
      </Typography>
      <Typography variant="caption" sx={{ color: pal.muted, letterSpacing: LIB_TRACKING }}>pts</Typography>
    </Box>
  );
}

const rowButtonSx = { width: SIZES.fill, display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 1, textAlign: 'left', fontFamily: 'inherit', color: 'inherit', '&.Mui-focusVisible': FOCUS_RING };

// One player: rank, picture and name, solved counts, last 7 days and points. The same row is pinned under the list for the signed-in player.
function PlayerRowButton({ row, isMe, track, wide, animated, onPick, selected }) {
  const { tier } = tierFor(row.score);
  return (
    <ButtonBase onClick={(event) => onPick(event, row)} aria-current={selected ? 'true' : undefined} sx={rowButtonSx}>
      <RankTile rank={row.rank} />
      <PlayerAvatar row={row} live={activeLabel(row.lastActive).live} />
      <PlayerIdentity row={row} isMe={isMe} tier={tier} />
      {wide && <SolvedStats row={row} track={track} />}
      {wide && <RecentCount recent={row.recent} />}
      <PointsCell row={row} animated={animated} />
    </ButtonBase>
  );
}

const tableRowSx = (pal, isMe, selected) => ({
  position: 'relative',
  borderBottom: `1px solid ${pal.divider}`,
  '&:last-of-type': { borderBottom: 'none' },
  bgcolor: selected ? alpha(LIB_ACCENT, 0.12) : isMe ? alpha(LIB_ACCENT, 0.06) : 'transparent',
  transition: `background-color ${MOTION.fast}ms`,
  '&:hover': { bgcolor: alpha(LIB_ACCENT, selected ? 0.12 : 0.06) },
  '&::before': selected ? { content: '""', position: 'absolute', left: 0, top: 0, bottom: 0, width: SIZES.leaderboard.accentBar, bgcolor: LIB_ACCENT } : undefined,
});

export function PlayerRow({ row, isMe, selected, ...rest }) {
  const pal = useLibraryPalette();
  return (
    <Box id={isMe ? 'lb-me' : undefined} sx={tableRowSx(pal, isMe, selected)}>
      <PlayerRowButton row={row} isMe={isMe} selected={selected} animated={false} {...rest} />
    </Box>
  );
}

export function PinnedPlayerRow(props) {
  return <PlayerRowButton {...props} isMe selected={false} animated />;
}
