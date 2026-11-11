import { useSelector } from 'react-redux';
import { Chip, List, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import BookmarkRoundedIcon from '@mui/icons-material/BookmarkRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import NewspaperRoundedIcon from '@mui/icons-material/NewspaperRounded';
import { FONT_WEIGHTS } from '../../../app/design/designTokens';
import { SAVED_FEED } from '../common/communityCategories';
import RailCard from './RailCard';

function Shortcut({ icon: Icon, label, soon = false, onClick }) {
  return (
    <ListItemButton disabled={soon} onClick={onClick}>
      <ListItemIcon sx={{ minWidth: 'auto', mr: 1.5 }}>
        <Icon fontSize="small" />
      </ListItemIcon>
      <ListItemText primary={label} slotProps={{ primary: { variant: 'body2', fontWeight: FONT_WEIGHTS.semibold } }} />
      {soon && <Chip size="small" label="Soon" />}
    </ListItemButton>
  );
}

// Saved items switches the feed to the Saved tab. Groups and Newsletters do not exist in JeetCode yet, so they
// are shown as "Soon" and cannot be opened.
export default function ShortcutsCard({ onShowSaved }) {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  if (!isAuthenticated) return null;

  return (
    <RailCard>
      <List disablePadding>
        <Shortcut icon={BookmarkRoundedIcon} label="Saved items" onClick={() => onShowSaved(SAVED_FEED)} />
        <Shortcut icon={GroupsRoundedIcon} label="Groups" soon />
        <Shortcut icon={NewspaperRoundedIcon} label="Newsletters" soon />
      </List>
    </RailCard>
  );
}
