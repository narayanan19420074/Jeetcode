import { useSelector } from 'react-redux';
import { Link as RouterLink } from 'react-router-dom';
import { List, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import BookmarkBorderRoundedIcon from '@mui/icons-material/BookmarkBorderRounded';
import InsightsRoundedIcon from '@mui/icons-material/InsightsRounded';
import WorkOutlineRoundedIcon from '@mui/icons-material/WorkOutlineRounded';
import { FONT_WEIGHTS } from '../../../app/design/designTokens';
import { SAVED_FEED } from '../common/communityCategories';
import RailCard from './RailCard';

function Shortcut({ icon: Icon, label, ...buttonProps }) {
  return (
    <ListItemButton {...buttonProps}>
      <ListItemIcon sx={{ minWidth: 'auto', mr: 1.5 }}>
        <Icon fontSize="small" />
      </ListItemIcon>
      <ListItemText primary={label} slotProps={{ primary: { variant: 'body2', fontWeight: FONT_WEIGHTS.semibold } }} />
    </ListItemButton>
  );
}

// Left rail second card: quick ways to your own pages. Saved posts switches the feed to the Saved tab.
export default function ShortcutsCard({ onShowSaved }) {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  if (!isAuthenticated) return null;

  return (
    <RailCard>
      <List disablePadding>
        <Shortcut icon={InsightsRoundedIcon} label="My stats" component={RouterLink} to="/you" />
        <Shortcut icon={WorkOutlineRoundedIcon} label="Job profile" component={RouterLink} to="/job-profile" />
        <Shortcut icon={BookmarkBorderRoundedIcon} label="Saved posts" onClick={() => onShowSaved(SAVED_FEED)} />
      </List>
    </RailCard>
  );
}
