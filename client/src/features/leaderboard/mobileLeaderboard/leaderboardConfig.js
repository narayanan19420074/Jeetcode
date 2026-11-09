import { COLOR_PALETTE } from '../../../app/design/designTokens';
import { LIB_ACCENT } from '../../dashboard/components/libraryStyle';

export const ACCENT = LIB_ACCENT;

export const TRACKS = [
  ['overall', 'Overall'],
  ['coding', 'Coding'],
  ['aptitude', 'Aptitude'],
];

export const PERIODS = [
  ['all', 'All-time'],
  ['week', 'Weekly'],
  ['month', 'Monthly'],
];

export const SCOPES = [
  ['global', 'Everyone'],
  ['friends', 'Friends'],
];

export const num = (n) => (n ?? 0).toLocaleString('en-IN');

// Rank number: plain muted digits; the top three sit in a soft gold, silver and bronze circle
// (same pastel-card colours as the dashboard, tinted in dark mode).
export const PODIUM = {
  1: { color: COLOR_PALETTE.custom.amberF09A2E, bg: COLOR_PALETTE.orange[50] },
  2: { color: COLOR_PALETTE.slate[500], bg: COLOR_PALETTE.slate[100] },
  3: { color: COLOR_PALETTE.custom.yellowB4693A, bg: COLOR_PALETTE.custom.orangeF8E9DE },
};
