import BarChartRoundedIcon from '@mui/icons-material/BarChartRounded';
import CalculateRoundedIcon from '@mui/icons-material/CalculateRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import PsychologyRoundedIcon from '@mui/icons-material/PsychologyRounded';
import { COLOR_PALETTE } from '../../../app/design/designTokens';

// Tracks (tabs). Each one is its own level road with its own START and accent colour.
// `color: null` = the app's primary colour. Keep trackOf() in sync with trackOf() in server/src/services/aptitude.service.js.
export const TRACKS = [
  { key: 'aptitude', label: 'Aptitude', short: 'Aptitude', icon: <CalculateRoundedIcon />, color: null },
  { key: 'reasoning', label: 'Reasoning', short: 'Reasoning', icon: <PsychologyRoundedIcon />, color: COLOR_PALETTE.violet[500] },
  { key: 'verbal', label: 'Verbal', short: 'Verbal', icon: <MenuBookRoundedIcon />, color: COLOR_PALETTE.pink[500] },
  { key: 'di', label: 'Data Interpretation', short: 'Data', icon: <BarChartRoundedIcon />, color: COLOR_PALETTE.orange[500] },
];

export function trackOf(category = '') {
  const text = String(category || '').toLowerCase();
  if (/logical|reason/.test(text)) return 'reasoning';
  if (/verbal/.test(text)) return 'verbal';
  if (/data/.test(text)) return 'di';
  return 'aptitude';
}

export const isCleared = (pattern) => pattern.progress.bestScore >= pattern.passPercentage;
