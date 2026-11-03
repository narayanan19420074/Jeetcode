import { useEffect, useState } from 'react';
import CalculateRoundedIcon from '@mui/icons-material/CalculateRounded';
import BarChartRoundedIcon from '@mui/icons-material/BarChartRounded';
import BusinessRoundedIcon from '@mui/icons-material/BusinessRounded';
import { problemsApi } from '../../../../api/problemsApi';
import { COLOR_PALETTE } from '../../../../app/design/designTokens';

export const MAX_TAGS = 30;
export const MAX_COMPANIES = 18;

// Card colours are the dashboard category-card colours: pastel card, same-hue icon (tinted in dark mode).
export const TOOLS = [
  { to: '/aptitude', title: 'Aptitude practice', text: 'Learn a pattern, practice it, then take a timed test.', icon: CalculateRoundedIcon, color: COLOR_PALETTE.custom.amberF09A2E, bg: COLOR_PALETTE.orange[50] },
  { to: '/visualizer', title: 'Algorithm visualizer', text: 'Watch sorting, searching and graph algorithms step by step.', icon: BarChartRoundedIcon, color: COLOR_PALETTE.custom.blue3F8CE8, bg: COLOR_PALETTE.blue[50] },
  { to: '/prep', title: 'Prep by company', text: 'See the exam pattern and track your readiness.', icon: BusinessRoundedIcon, color: COLOR_PALETTE.custom.emerald22A06B, bg: COLOR_PALETTE.green[50] },
];

// null = still loading, [] = nothing to show (the section is hidden).
export function useExploreData() {
  const [tags, setTags] = useState(null);
  const [companies, setCompanies] = useState(null);

  useEffect(() => {
    problemsApi.getTags().then(({ data }) => setTags(data.data.items.slice(0, MAX_TAGS))).catch(() => setTags([]));
    problemsApi.getCompanies().then(({ data }) => setCompanies(data.data.items.slice(0, MAX_COMPANIES))).catch(() => setCompanies([]));
  }, []);

  return { tags, companies };
}
