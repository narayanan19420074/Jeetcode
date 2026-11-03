import BarChartRoundedIcon from '@mui/icons-material/BarChartRounded';
import CalculateRoundedIcon from '@mui/icons-material/CalculateRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import PsychologyRoundedIcon from '@mui/icons-material/PsychologyRounded';

// Tracks (tabs). Each one is its own level road with its own START and accent colour.
// `color: null` = the app's primary colour. Keep trackOf() in sync with trackOf() in server/src/services/aptitude.service.js.
export const TRACKS = [
  { key: 'aptitude', label: 'Aptitude', short: 'Aptitude', icon: <CalculateRoundedIcon />, color: null },
  { key: 'reasoning', label: 'Reasoning', short: 'Reasoning', icon: <PsychologyRoundedIcon />, color: '#8B5CF6' },
  { key: 'verbal', label: 'Verbal', short: 'Verbal', icon: <MenuBookRoundedIcon />, color: '#EC4899' },
  { key: 'di', label: 'Data Interpretation', short: 'Data', icon: <BarChartRoundedIcon />, color: '#F97316' },
];

export function trackOf(category = '') {
  const text = String(category || '').toLowerCase();
  if (/logical|reason/.test(text)) return 'reasoning';
  if (/verbal/.test(text)) return 'verbal';
  if (/data/.test(text)) return 'di';
  return 'aptitude';
}

export const isCleared = (pattern) => pattern.progress.bestScore >= pattern.passPercentage;
