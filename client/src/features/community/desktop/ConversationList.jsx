import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Link as RouterLink } from 'react-router-dom';
import { Box, ButtonBase, InputBase, Link, List, ListItemButton, Stack, Typography } from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import { PersonAvatar } from '../../friends/friendsUi';
import { previewOf, shortTime } from '../../friends/friendsKit';
import { FONT_WEIGHTS, RADII_PX, SIZES } from '../../../app/design/designTokens';

const TABS = [{ id: 'all', label: 'All' }, { id: 'online', label: 'Online' }];
const lastAt = (last, id) => (last[id]?.at ? Date.parse(last[id].at) : 0);

function ConversationRow({ friend, last, myId, online, unread, onOpen }) {
  return (
    <ListItemButton onClick={() => onOpen(friend.userId)} sx={{ gap: 1.5, alignItems: 'flex-start' }}>
      <PersonAvatar person={friend} size={SIZES.avatar.md} online={online} />
      <Box sx={{ flex: 1, minWidth: SIZES.flexShrinkMinWidth }}>
        <Typography noWrap sx={{ fontWeight: unread ? FONT_WEIGHTS.bold : FONT_WEIGHTS.semibold }}>{friend.name}</Typography>
        <Typography variant="body2" color="text.secondary" noWrap>{previewOf(last, myId) || `@${friend.handle}`}</Typography>
      </Box>
      <Stack sx={{ alignItems: 'flex-end' }}>
        {last && <Typography variant="caption" color="text.secondary">{shortTime(last.at)}</Typography>}
        {unread > 0 && <Box component="span" sx={{ px: 0.75, borderRadius: RADII_PX.pill, bgcolor: 'primary.main', color: 'primary.contrastText', typography: 'caption' }}>{unread}</Box>}
      </Stack>
    </ListItemButton>
  );
}

function Tabs({ value, onChange }) {
  return (
    <Stack direction="row" role="tablist">
      {TABS.map((tab) => (
        <ButtonBase key={tab.id} role="tab" aria-selected={tab.id === value} onClick={() => onChange(tab.id)} sx={{ flex: 1, py: 1, fontFamily: 'inherit', fontWeight: FONT_WEIGHTS.semibold, color: tab.id === value ? 'text.primary' : 'text.secondary', borderBottom: '2px solid', borderColor: tab.id === value ? 'primary.main' : 'divider' }}>
          {tab.label}
        </ButtonBase>
      ))}
    </Stack>
  );
}

// Conversations of the dock: search, an All / Online switch, then your friends with the newest chat first.
export default function ConversationList({ onOpen }) {
  const { friends, last, online, unread } = useSelector((state) => state.friends);
  const myId = useSelector((state) => state.auth.user?.id);
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState('all');
  const needle = query.trim().toLowerCase();
  const rows = friends
    .filter((f) => (tab === 'all' || online[f.userId]) && (!needle || `${f.name} ${f.handle}`.toLowerCase().includes(needle)))
    .sort((a, b) => lastAt(last, b.userId) - lastAt(last, a.userId));

  return (
    <Stack sx={{ flex: 1, minHeight: SIZES.flexShrinkMinHeight }}>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', m: 1.5, px: 1.5, borderRadius: RADII_PX.control, bgcolor: 'action.hover' }}>
        <SearchRoundedIcon fontSize="small" color="action" />
        <InputBase fullWidth placeholder="Search messages" value={query} onChange={(e) => setQuery(e.target.value)} inputProps={{ 'aria-label': 'Search messages' }} />
      </Stack>
      <Tabs value={tab} onChange={setTab} />
      <List disablePadding sx={{ flex: 1, overflowY: 'auto' }}>
        {rows.map((f) => <ConversationRow key={f.userId} friend={f} last={last[f.userId]} myId={myId} online={Boolean(online[f.userId])} unread={unread[f.userId]} onOpen={onOpen} />)}
        {rows.length === 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
            {friends.length === 0 ? <>No friends yet. <Link component={RouterLink} to="/dashboard?view=friends">Add friends</Link> to start chatting.</> : 'No conversations found.'}
          </Typography>
        )}
      </List>
    </Stack>
  );
}
