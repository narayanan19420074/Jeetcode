import { Avatar, Box, Tooltip, Typography } from '@mui/material';
import WorkspacePremiumRoundedIcon from '@mui/icons-material/WorkspacePremiumRounded';
import LocalFireDepartmentRoundedIcon from '@mui/icons-material/LocalFireDepartmentRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import PsychologyRoundedIcon from '@mui/icons-material/PsychologyRounded';
import { railCardSx } from '../../dashboard/components/rail/railCardStyles';
import { EMERALD, GOLD_A, SOFT } from '../../dashboard/components/rail/railTokens';
import { COLOR_PALETTE, withAlpha, FONT_SIZES, FONT_WEIGHTS, MOTION, RADII_PX, SIZES } from '../../../app/design/designTokens';
import { tierFor } from '../tiers';
import { CountUp, YouChip } from '../lbShared';
import { MEDAL_INK, TABULAR } from './lbLook';

const tileSx = { p: 1, textAlign: 'center', minWidth: SIZES.flexShrinkMinWidth, borderRadius: RADII_PX.control, bgcolor: withAlpha(COLOR_PALETTE.white, 0.12) };
const labelSx = { fontSize: FONT_SIZES.micro, fontWeight: FONT_WEIGHTS.bold, letterSpacing: 0.8, textTransform: 'uppercase', color: SOFT };
const valueSx = [{ fontSize: FONT_SIZES.display, fontWeight: FONT_WEIGHTS.bold, lineHeight: 1.3 }, TABULAR];
const chipSx = { display: 'inline-flex', alignItems: 'center', gap: 0.5, px: 1, borderRadius: RADII_PX.pill, bgcolor: withAlpha(COLOR_PALETTE.white, 0.16), fontSize: FONT_SIZES.caption, fontWeight: FONT_WEIGHTS.semibold, lineHeight: 1.7 };

function Identity({ row, isMe, topPercent, learners }) {
  const { tier } = tierFor(row.score);
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
      <Avatar src={row.avatarUrl || undefined} alt={row.name} sx={{ width: SIZES.leaderboard.panelAvatar, height: SIZES.leaderboard.panelAvatar, fontSize: FONT_SIZES.heading, fontWeight: FONT_WEIGHTS.bold, color: COLOR_PALETTE.white, bgcolor: withAlpha(COLOR_PALETTE.white, 0.2) }}>{row.name?.[0]?.toUpperCase()}</Avatar>
      <Box sx={{ flex: 1, minWidth: SIZES.flexShrinkMinWidth }}>
        <Typography noWrap sx={{ fontSize: FONT_SIZES.subheading, fontWeight: FONT_WEIGHTS.bold, lineHeight: 1.25 }}>{row.name}{isMe && <YouChip />}</Typography>
        <Typography noWrap sx={{ fontSize: FONT_SIZES.body, color: SOFT }}>@{row.handle}</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5, flexWrap: 'wrap' }}>
          <Box sx={chipSx}><WorkspacePremiumRoundedIcon sx={{ fontSize: FONT_SIZES.body, color: COLOR_PALETTE.amber[200] }} />{tier.name}</Box>
          {isMe && topPercent && learners > 0 && <Tooltip title={`Top ${topPercent}% of ${learners.toLocaleString()} ranked players`}><Box sx={chipSx}>Top {topPercent}%</Box></Tooltip>}
        </Box>
      </Box>
    </Box>
  );
}

function StatTiles({ row, loading }) {
  const ink = MEDAL_INK[row.rank];
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 1 }}>
      <Box sx={tileSx}><Typography sx={labelSx}>Rank</Typography><Typography noWrap sx={[...valueSx, ink && { color: GOLD_A }]}>#{row.rank}</Typography></Box>
      <Box sx={tileSx}><Typography sx={labelSx}>Points</Typography><Typography noWrap sx={valueSx}>{loading ? row.score.toLocaleString() : <CountUp value={row.score} />}</Typography></Box>
      <Box sx={tileSx}>
        <Typography sx={labelSx}>Streak</Typography>
        <Typography noWrap sx={valueSx}><LocalFireDepartmentRoundedIcon sx={{ fontSize: FONT_SIZES.display, verticalAlign: 'text-bottom', color: row.streak > 0 ? COLOR_PALETTE.orange[300] : SOFT }} />{row.streak}</Typography>
      </Box>
    </Box>
  );
}

const HERO_DIFF = { easy: EMERALD, medium: GOLD_A, hard: COLOR_PALETTE.rose[300] };

function SolvedBreakdown({ row, track, points }) {
  const coding = row.easy + row.medium + row.hard;
  if (track === 'aptitude') return <Typography sx={{ fontSize: FONT_SIZES.body, fontWeight: FONT_WEIGHTS.semibold }}>{(row.aptitude * points.aptitude).toLocaleString()} pts from aptitude</Typography>;
  const cells = track === 'coding'
    ? [['Easy', row.easy, points.easy, HERO_DIFF.easy], ['Medium', row.medium, points.medium, HERO_DIFF.medium], ['Hard', row.hard, points.hard, HERO_DIFF.hard]]
    : [['Coding', coding, null, COLOR_PALETTE.sky[300]], ['Aptitude', row.aptitude, null, COLOR_PALETTE.purple[200]]];
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: `repeat(${cells.length}, minmax(0, 1fr))`, gap: 1 }}>
      {cells.map(([label, count, pts, color]) => (
        <Box key={label} sx={tileSx}>
          <Typography sx={[{ fontSize: FONT_SIZES.heading, fontWeight: FONT_WEIGHTS.bold, lineHeight: 1.15, color }, TABULAR]}>{count}</Typography>
          <Typography noWrap sx={{ fontSize: FONT_SIZES.caption, fontWeight: FONT_WEIGHTS.semibold }}>{label}</Typography>
          {pts !== null && <Typography noWrap sx={[{ fontSize: FONT_SIZES.micro, color: SOFT }, TABULAR]}>{count * pts} pts</Typography>}
        </Box>
      ))}
    </Box>
  );
}

function TierProgress({ score }) {
  const { next, progress, toNext } = tierFor(score);
  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 0.5 }}>
        <Typography sx={{ fontSize: FONT_SIZES.body, fontWeight: FONT_WEIGHTS.semibold }}>{next ? `Next: ${next.name}` : 'Top tier'}</Typography>
        <Typography noWrap sx={[{ fontSize: FONT_SIZES.caption, fontWeight: FONT_WEIGHTS.semibold, color: GOLD_A }, TABULAR]}>{next ? `${toNext.toLocaleString()} pts` : 'Reached'}</Typography>
      </Box>
      <Box role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress} aria-label="Progress to next tier" sx={{ height: SIZES.leaderboard.progress, borderRadius: RADII_PX.pill, bgcolor: withAlpha(COLOR_PALETTE.white, 0.2), overflow: 'hidden' }}>
        <Box sx={{ width: `${Math.max(progress, 4)}%`, height: SIZES.fill, borderRadius: RADII_PX.pill, bgcolor: GOLD_A, transition: `width ${MOTION.progress}ms ease` }} />
      </Box>
    </Box>
  );
}

// The selected player on the indigo card the dashboard uses for the streak calendar.
export default function SideHero({ row, isMe, track, points, learners, topPercent, loading }) {
  return (
    <Box sx={[...railCardSx, { display: 'grid', gap: 2 }]}>
      <Identity row={row} isMe={isMe} topPercent={topPercent} learners={learners} />
      <StatTiles row={row} loading={loading} />
      <SolvedBreakdown row={row} track={track} points={points} />
      <TierProgress score={row.score} />
    </Box>
  );
}

export function EmptyHero({ loading }) {
  return (
    <Box sx={[...railCardSx, { textAlign: 'center', py: 4 }]}>
      <Typography sx={{ fontWeight: FONT_WEIGHTS.bold }}>{loading ? 'Loading player' : 'No player selected'}</Typography>
      {!loading && <Typography sx={{ fontSize: FONT_SIZES.body, color: SOFT }}>Select a player on the board.</Typography>}
    </Box>
  );
}
