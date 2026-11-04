import { Link as RouterLink } from 'react-router-dom';
import { Box, ButtonBase, IconButton, Stack, Typography } from '@mui/material';
import EventRoundedIcon from '@mui/icons-material/EventRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import StarBorderRoundedIcon from '@mui/icons-material/StarBorderRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import RemoveRoundedIcon from '@mui/icons-material/RemoveRounded';
import { DIFF_COLOR, tint } from '../dashboardUtils';
import { LIB_TRACKING } from './libraryStyle';
import { COLOR_PALETTE, FONT_SIZES, FONT_WEIGHTS, RADII_PX, SIZES } from '../../../app/design/designTokens';

export const ACCENT = COLOR_PALETTE.indigo[500];
const SHORT_DIFF = { Easy: 'Easy', Medium: 'Med.', Hard: 'Hard' };

function DifficultyTag({ difficulty }) {
  const color = DIFF_COLOR[difficulty] || 'var(--jc-pending)';
  return (
    <Typography
      component="span"
      sx={{
        flexShrink: 0,
        minWidth: SIZES.problemDifficultyColumn,
        textAlign: 'center',
        px: 0.5,
        py: 0.5,
        borderRadius: RADII_PX.control,
        fontSize: FONT_SIZES.bodyLg,
        fontWeight: FONT_WEIGHTS.regular,
        letterSpacing: LIB_TRACKING,
        lineHeight: '20px',
        color,
        bgcolor: tint(color, 14),
      }}
    >
      {SHORT_DIFF[difficulty] || difficulty}
    </Typography>
  );
}

function SolvedMarker({ solved, pal }) {
  const iconSx = { fontSize: FONT_SIZES.heading };
  if (solved) return <CheckCircleRoundedIcon aria-label="Solved" sx={{ ...iconSx, color: 'var(--jc-easy)' }} />;
  return <RemoveRoundedIcon aria-label="Not solved" sx={{ ...iconSx, color: pal.muted, opacity: 0.6 }} />;
}

function ProblemTitleLine({ index, title, isDaily }) {
  return (
    <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', minWidth: SIZES.flexShrinkMinWidth }}>
      <Typography noWrap sx={{ fontWeight: FONT_WEIGHTS.medium, fontSize: FONT_SIZES.subheading, lineHeight: '28px', letterSpacing: LIB_TRACKING, minWidth: SIZES.flexShrinkMinWidth }}>
        {index}. {title}
      </Typography>
      {isDaily && <EventRoundedIcon aria-label="Today's challenge" sx={{ fontSize: FONT_SIZES.subheading, color: ACCENT, flexShrink: 0 }} />}
    </Stack>
  );
}

function ProblemMetaLine({ acceptanceRate, locked, pal }) {
  return (
    <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mt: 1.5, color: pal.muted }}>
      <Typography sx={{ fontSize: FONT_SIZES.bodyLg, letterSpacing: LIB_TRACKING, fontVariantNumeric: 'tabular-nums' }}>Acceptance {(acceptanceRate ?? 0).toFixed(1)}%</Typography>
      {locked && <LockRoundedIcon aria-label="Pro problem" sx={{ fontSize: FONT_SIZES.title, color: 'warning.main' }} />}
    </Stack>
  );
}

const rowLinkSx = { flex: 1, minWidth: SIZES.flexShrinkMinWidth, display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-start', gap: 1.5, py: 2, textAlign: 'left', fontFamily: 'inherit', color: 'inherit' };

function ProblemRowLink({ p, index, isDaily, pal }) {
  return (
    <ButtonBase component={RouterLink} to={`/workspace/${p.slug}`} sx={rowLinkSx}>
      <Stack sx={{ width: SIZES.problemDifficultyColumn, flexShrink: 0, alignItems: 'center', gap: 1.5, pt: 0.5 }}>
        <DifficultyTag difficulty={p.difficulty} />
        <SolvedMarker solved={p.solvedByMe} pal={pal} />
      </Stack>
      <Box sx={{ minWidth: SIZES.flexShrinkMinWidth, flex: 1 }}>
        <ProblemTitleLine index={index} title={p.title} isDaily={isDaily} />
        <ProblemMetaLine acceptanceRate={p.acceptanceRate} locked={p.locked} pal={pal} />
      </Box>
    </ButtonBase>
  );
}

export default function ProblemRow({ p, index, isDaily, saved, onStar, pal }) {
  const starLabel = saved ? `Manage lists for ${p.title}` : `Save ${p.title} to a list`;
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', borderBottom: `1px solid ${pal.divider}`, '&:last-of-type': { borderBottom: 'none' } }}>
      <ProblemRowLink p={p} index={index} isDaily={isDaily} pal={pal} />
      <IconButton size="small" onClick={(e) => onStar(e.currentTarget, p)} aria-label={starLabel} sx={{ width: SIZES.touchTarget, height: SIZES.touchTarget }}>
        {saved ? <StarRoundedIcon sx={{ color: 'warning.main' }} /> : <StarBorderRoundedIcon />}
      </IconButton>
    </Box>
  );
}
