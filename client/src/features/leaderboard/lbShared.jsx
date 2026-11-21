import { useEffect, useState } from 'react';
import { animate, useReducedMotion } from 'framer-motion';
import { Box } from '@mui/material';
import { DIFF_COLOR, todayKey } from '../dashboard/dashboardUtils';
import { PLAN_AMBER } from '../studyplan/planUtils';
import { COLOR_PALETTE, withAlpha, FONT_WEIGHTS, FONT_SIZES, RADII_PX, SIZES } from '../../app/design/designTokens';

// Bits shared by the desktop board, the side panel and the phone leaderboard.

export const APT_COLOR = COLOR_PALETTE.violet[500];
export const PT = { easy: 10, medium: 20, hard: 40, aptitude: 5 };

const COUNT_UP_SECONDS = 1.1;

// Counts up to the score the first time it shows.
export function CountUp({ value }) {
  const reduce = useReducedMotion();
  const [shown, setShown] = useState(reduce ? value : 0);
  useEffect(() => {
    if (reduce) { setShown(value); return undefined; }
    const controls = animate(0, value, { duration: COUNT_UP_SECONDS, ease: 'easeOut', onUpdate: (v) => setShown(Math.round(v)) });
    return () => controls.stop();
  }, [value, reduce]);
  return shown.toLocaleString();
}

const MS_PER_DAY = 86400000;

// Streaks and the "active today" rule use India days, the same as the server.
export function activeLabel(lastActive) {
  if (!lastActive) return { text: 'Not started', color: 'text.disabled', live: false };
  const days = Math.round((Date.parse(todayKey()) - Date.parse(lastActive)) / MS_PER_DAY);
  if (days <= 0) return { text: 'Active today', color: 'success.main', live: true };
  if (days === 1) return { text: 'Active yesterday', color: 'warning.main', live: false };
  return { text: `${days}d ago`, color: 'text.disabled', live: false };
}

// How a player's points split across Easy / Medium / Hard / Aptitude.
export function Mix({ row, onDark = false, sx }) {
  const parts = [
    [row.easy * PT.easy, DIFF_COLOR.Easy],
    [row.medium * PT.medium, DIFF_COLOR.Medium],
    [row.hard * PT.hard, DIFF_COLOR.Hard],
    [row.aptitude * PT.aptitude, APT_COLOR],
  ].filter(([points]) => points > 0);
  return (
    <Box aria-hidden sx={[{ display: 'flex', gap: 0.5, height: SIZES.progressBarHeight, borderRadius: RADII_PX.pill, overflow: 'hidden', bgcolor: onDark ? withAlpha(COLOR_PALETTE.white, 0.2) : 'divider' }, sx]}>
      {parts.map(([points, color]) => <Box key={color} sx={{ flex: points, bgcolor: color }} />)}
    </Box>
  );
}

export function YouChip() {
  return <Box component="span" sx={{ ml: 1, px: 1, borderRadius: RADII_PX.pill, fontSize: FONT_SIZES.micro, fontWeight: FONT_WEIGHTS.bold, color: COLOR_PALETTE.custom.black1B1200, bgcolor: PLAN_AMBER, verticalAlign: 'middle', flexShrink: 0 }}>You</Box>;
}
