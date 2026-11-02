import { Box, Skeleton, Stack, Typography } from '@mui/material';
import { DIFF_COLOR, tint } from '../../dashboardUtils';
import { DIFFICULTIES } from '../common/problemsConstants';

function DifficultyStat({ label, solved, total }) {
  const percent = total ? Math.min((solved / total) * 100, 100) : 0;
  const color = DIFF_COLOR[label];
  return (
    <Box sx={{ minWidth: 0 }}>
      <Stack direction="row" sx={{ alignItems: 'baseline', justifyContent: 'space-between', mb: 0.75 }}>
        <Typography sx={{ fontSize: 14, fontWeight: 500, color }}>{label}</Typography>
        <Typography sx={{ fontSize: 14, fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>
          {solved}
          <Box component="span" sx={{ color: 'text.secondary' }}>/{total}</Box>
        </Typography>
      </Stack>
      <Box sx={{ height: 6, borderRadius: 999, overflow: 'hidden', bgcolor: tint(color, 18) }}>
        <Box sx={{ width: `${percent}%`, height: '100%', borderRadius: 999, bgcolor: color, transition: 'width .5s cubic-bezier(.4,0,.2,1)' }} />
      </Box>
    </Box>
  );
}

// Solved count per difficulty, one bar each.
export default function DifficultyBars({ progress }) {
  return (
    <Box sx={{ display: 'grid', gap: 1.5 }}>
      {DIFFICULTIES.map((level) => (progress
        ? <DifficultyStat key={level} label={level} solved={progress.solved?.[level] || 0} total={progress.total?.[level] || 0} />
        : <Skeleton key={level} variant="rounded" height={30} />))}
    </Box>
  );
}
