import { useMemo } from 'react';
import EventRoundedIcon from '@mui/icons-material/EventRounded';
import BusinessRoundedIcon from '@mui/icons-material/BusinessRounded';
import WorkspacePremiumRoundedIcon from '@mui/icons-material/WorkspacePremiumRounded';
import CalculateRoundedIcon from '@mui/icons-material/CalculateRounded';
import BarChartRoundedIcon from '@mui/icons-material/BarChartRounded';
import { COLOR_PALETTE } from '../../../app/design/designTokens';

const gradient = (from, to) => `linear-gradient(135deg,${from},${to})`;

const dailyChallengeCard = (featured) => ({
  key: 'daily',
  title: 'Today’s challenge',
  text: `${featured.title} (${featured.difficulty})`,
  cta: 'Solve now',
  to: `/workspace/${featured.slug}`,
  icon: EventRoundedIcon,
  gradient: gradient(COLOR_PALETTE.slate[700], COLOR_PALETTE.slate[900]),
});

const COMPANY_PREP_CARD = {
  key: 'prep',
  title: 'Prep by company',
  text: 'See the exam pattern and track how ready you are for each drive.',
  cta: 'Open prep',
  to: '/prep',
  icon: BusinessRoundedIcon,
  gradient: gradient(COLOR_PALETTE.emerald[700], COLOR_PALETTE.cyan[700]),
};

const PRO_CARD = {
  key: 'pro',
  title: 'Go Pro',
  text: 'Unlock every problem tagged with a company.',
  cta: 'See plans',
  to: '/pricing',
  icon: WorkspacePremiumRoundedIcon,
  gradient: gradient(COLOR_PALETTE.amber[700], COLOR_PALETTE.amber[900]),
};

const PRACTICE_CARDS = [
  {
    key: 'aptitude',
    title: 'Aptitude practice',
    text: 'Learn a pattern, practice it, then take a timed test.',
    cta: 'Start practicing',
    to: '/aptitude',
    icon: CalculateRoundedIcon,
    gradient: gradient(COLOR_PALETTE.violet[600], COLOR_PALETTE.violet[900]),
  },
  {
    key: 'visualizer',
    title: 'Algorithm visualizer',
    text: 'Watch sorting, searching and graph algorithms run step by step.',
    cta: 'Explore',
    to: '/visualizer',
    icon: BarChartRoundedIcon,
    gradient: gradient(COLOR_PALETTE.cyan[700], COLOR_PALETTE.cyan[900]),
  },
];

// The promo cards of the dashboard. Today's challenge appears once the featured problem has loaded,
// and the Pro card is hidden for people who already have Pro.
export default function usePromoCards(featured, isPro) {
  return useMemo(
    () => [...(featured ? [dailyChallengeCard(featured)] : []), COMPANY_PREP_CARD, ...(isPro ? [] : [PRO_CARD]), ...PRACTICE_CARDS],
    [featured, isPro]
  );
}
