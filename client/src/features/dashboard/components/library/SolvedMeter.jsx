import { Box, Stack, Tooltip, Typography } from '@mui/material';
import { COLOR_PALETTE } from '../../../../app/design/designTokens';

const RADIUS = 9;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];

function CompletionRing({ fraction }) {
  const ring = { cx: 12, cy: 12, r: RADIUS, fill: 'none', strokeWidth: 3 };
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
      <circle {...ring} stroke="currentColor" strokeOpacity="0.15" />
      <circle
        {...ring}
        stroke={COLOR_PALETTE.emerald[500]}
        strokeLinecap="round"
        strokeDasharray={`${CIRCUMFERENCE * fraction} ${CIRCUMFERENCE}`}
        transform="rotate(-90 12 12)"
      />
    </svg>
  );
}

// Small completion ring + "x/y Solved", like LeetCode's list header. The tooltip breaks it down by difficulty.
export default function SolvedMeter({ solved, total, solvedBy, totals }) {
  const fraction = total ? Math.min(solved / total, 1) : 0;
  const detail = DIFFICULTIES.map((d) => `${d} ${solvedBy?.[d] ?? 0}/${totals?.[d] ?? 0}`).join('  ·  ');
  return (
    <Tooltip title={detail}>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexShrink: 0 }}>
        <CompletionRing fraction={fraction} />
        <Typography variant="body2" sx={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
          {solved}
          <Box component="span" sx={{ color: 'text.secondary', fontWeight: 500 }}>
            /{total} Solved
          </Box>
        </Typography>
      </Stack>
    </Tooltip>
  );
}
