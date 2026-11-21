import { Box, Typography } from '@mui/material';
import { DIFF_COLOR } from '../../dashboardUtils';
import { useLibraryPalette } from '../../components/libraryStyle';
import { FONT_SIZES, FONT_WEIGHTS, withAlpha } from '../../../../app/design/designTokens';
import { DIFFICULTIES } from '../common/problemsConstants';

// An open ring (a gauge) with one arc per difficulty, as long as that difficulty has problems. The solved part of each arc
// is drawn in its colour on top of a faint track; the number of solved problems sits in the middle.
const CENTER = 60;
const RADIUS = 50;
const STROKE = 8;
const DOT_RADIUS = 5;
const START_DEG = 135;
const SWEEP_DEG = 270;
const GAP_DEG = 10;
const TRACK_ALPHA = 0.1;

const point = (deg) => {
  const rad = (deg * Math.PI) / 180;
  return [CENTER + RADIUS * Math.cos(rad), CENTER + RADIUS * Math.sin(rad)];
};

function arcPath(fromDeg, toDeg) {
  const [x1, y1] = point(fromDeg);
  const [x2, y2] = point(toDeg);
  return `M ${x1} ${y1} A ${RADIUS} ${RADIUS} 0 ${toDeg - fromDeg > 180 ? 1 : 0} 1 ${x2} ${y2}`;
}

// Where each difficulty's arc starts and how many degrees it covers.
function layoutArcs(totals) {
  const all = DIFFICULTIES.reduce((sum, level) => sum + (totals?.[level] || 0), 0);
  const usable = SWEEP_DEG - GAP_DEG * (DIFFICULTIES.length - 1);
  let cursor = START_DEG;
  return DIFFICULTIES.map((level) => {
    const length = all ? ((totals[level] || 0) / all) * usable : usable / DIFFICULTIES.length;
    const arc = { level, from: cursor, length };
    cursor += length + GAP_DEG;
    return arc;
  });
}

function Arc({ arc, solved, total, trackColor }) {
  const fraction = total ? Math.min(solved / total, 1) : 0;
  const [dotX, dotY] = point(arc.from);
  return (
    <g>
      <path d={arcPath(arc.from, arc.from + arc.length)} fill="none" strokeWidth={STROKE} strokeLinecap="round" stroke={trackColor} />
      {fraction > 0 && <path d={arcPath(arc.from, arc.from + arc.length * fraction)} fill="none" strokeWidth={STROKE} strokeLinecap="round" style={{ stroke: DIFF_COLOR[arc.level] }} />}
      <circle cx={dotX} cy={dotY} r={DOT_RADIUS} style={{ fill: DIFF_COLOR[arc.level] }} />
    </g>
  );
}

export default function DifficultyGauge({ solved, totals }) {
  const pal = useLibraryPalette();
  const solvedAll = DIFFICULTIES.reduce((sum, level) => sum + (solved?.[level] || 0), 0);
  const totalAll = DIFFICULTIES.reduce((sum, level) => sum + (totals?.[level] || 0), 0);
  return (
    <Box sx={{ position: 'relative', display: 'grid', placeItems: 'center' }} role="img" aria-label={`${solvedAll} of ${totalAll} solved`}>
      <svg viewBox="0 0 120 120" width="100%" aria-hidden="true">
        {layoutArcs(totals).map((arc) => <Arc key={arc.level} arc={arc} solved={solved?.[arc.level] || 0} total={totals?.[arc.level] || 0} trackColor={withAlpha(pal.text, TRACK_ALPHA)} />)}
      </svg>
      <Box sx={{ position: 'absolute', textAlign: 'center' }}>
        <Typography sx={{ fontSize: FONT_SIZES.hero, fontWeight: FONT_WEIGHTS.bold, lineHeight: 1, color: pal.text }}>{solvedAll}</Typography>
        <Typography variant="caption" sx={{ color: pal.muted }}>/{totalAll} Solved</Typography>
      </Box>
    </Box>
  );
}
