import { useEffect, useState } from 'react';
import CalculateRoundedIcon from '@mui/icons-material/CalculateRounded';
import BarChartRoundedIcon from '@mui/icons-material/BarChartRounded';
import BusinessRoundedIcon from '@mui/icons-material/BusinessRounded';
import { problemsApi } from '../../../../api/problemsApi';

export const MAX_TAGS = 30;
export const MAX_COMPANIES = 18;

// Card colours are the dashboard category-card colours: pastel card, same-hue icon (tinted in dark mode).
export const TOOLS = [
  { to: '/aptitude', title: 'Aptitude practice', text: 'Learn a pattern, practice it, then take a timed test.', icon: CalculateRoundedIcon, color: '#F09A2E', bg: '#FFF2E3' },
  { to: '/visualizer', title: 'Algorithm visualizer', text: 'Watch sorting, searching and graph algorithms step by step.', icon: BarChartRoundedIcon, color: '#3F8CE8', bg: '#EDF2F9' },
  { to: '/prep', title: 'Prep by company', text: 'See the exam pattern and track your readiness.', icon: BusinessRoundedIcon, color: '#22A06B', bg: '#EAF6EE' },
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
