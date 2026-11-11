import { useSelector } from 'react-redux';
import { Link as RouterLink } from 'react-router-dom';
import { Box, List, ListItemButton, Typography } from '@mui/material';
import CalculateRoundedIcon from '@mui/icons-material/CalculateRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import { useProgressAndFeatured } from '../../dashboard/problems/common/useProblemsPageData';
import { FONT_WEIGHTS, RADII_PX, SIZES } from '../../../app/design/designTokens';
import RailCard from './RailCard';

function PuzzleRow({ icon: Icon, color, title, subtitle, to }) {
  return (
    <ListItemButton component={RouterLink} to={to} sx={{ gap: 1.5 }}>
      <Box sx={{ display: 'grid', placeItems: 'center', width: SIZES.avatar.lg, height: SIZES.avatar.lg, borderRadius: RADII_PX.card, bgcolor: `${color}.main`, color: `${color}.contrastText` }}>
        <Icon />
      </Box>
      <Box sx={{ flex: 1, minWidth: SIZES.flexShrinkMinWidth }}>
        <Typography noWrap sx={{ fontWeight: FONT_WEIGHTS.semibold }}>{title}</Typography>
        <Typography variant="body2" color="text.secondary" noWrap>{subtitle}</Typography>
      </Box>
      <ChevronRightRoundedIcon color="action" />
    </ListItemButton>
  );
}

// Right rail "Today's puzzles": the daily problem everyone gets, and a way into aptitude practice.
export default function PuzzlesCard() {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const { featured } = useProgressAndFeatured(isAuthenticated);

  return (
    <RailCard>
      <Typography component="h2" variant="h6" sx={{ px: 2, pt: 2, fontWeight: FONT_WEIGHTS.bold }}>Today's puzzles</Typography>
      <List sx={{ pb: 1 }}>
        {featured && <PuzzleRow icon={CodeRoundedIcon} color="primary" title={featured.title} subtitle={`Daily problem · ${featured.difficulty}`} to={`/workspace/${featured.slug}`} />}
        <PuzzleRow icon={CalculateRoundedIcon} color="warning" title="Aptitude practice" subtitle="Clear the next level" to="/aptitude" />
      </List>
    </RailCard>
  );
}
