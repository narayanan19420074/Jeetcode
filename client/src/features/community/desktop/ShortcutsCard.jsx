import { useSelector } from 'react-redux';
import { List, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import BookmarkRoundedIcon from '@mui/icons-material/BookmarkRounded';
import { FONT_WEIGHTS } from '../../../app/design/designTokens';
import { SAVED_FEED } from '../common/communityCategories';
import { CHANNEL_KINDS } from '../common/channels/channelKinds';
import { CHANNEL_ICONS } from './channels/channelIcons';
import RailCard from './RailCard';

function Shortcut({ icon: Icon, label, onClick }) {
  return (
    <ListItemButton onClick={onClick}>
      <ListItemIcon sx={{ minWidth: 'auto', mr: 1.5 }}>
        <Icon fontSize="small" />
      </ListItemIcon>
      <ListItemText primary={label} slotProps={{ primary: { variant: 'body2', fontWeight: FONT_WEIGHTS.semibold } }} />
    </ListItemButton>
  );
}

// Saved items switches the feed to the Saved tab. Groups and Newsletters open their own pages in the middle column.
export default function ShortcutsCard({ onShowSaved, onOpenChannels }) {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  if (!isAuthenticated) return null;

  return (
    <RailCard>
      <List disablePadding>
        <Shortcut icon={BookmarkRoundedIcon} label="Saved items" onClick={() => onShowSaved(SAVED_FEED)} />
        {Object.values(CHANNEL_KINDS).map(({ kind, title }) => (
          <Shortcut key={kind} icon={CHANNEL_ICONS[kind]} label={title} onClick={() => onOpenChannels(kind)} />
        ))}
      </List>
    </RailCard>
  );
}
