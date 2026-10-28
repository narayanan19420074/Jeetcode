import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Box, ButtonBase, IconButton, Tooltip, Typography, alpha } from '@mui/material';
import LibraryBooksRoundedIcon from '@mui/icons-material/LibraryBooksRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import MilitaryTechRoundedIcon from '@mui/icons-material/MilitaryTechRounded';
import ExploreRoundedIcon from '@mui/icons-material/ExploreRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import LeaderboardRoundedIcon from '@mui/icons-material/LeaderboardRounded';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import ListAltRoundedIcon from '@mui/icons-material/ListAltRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import { NameDialog } from './ListDialogs';

export const NAV_ITEMS = [
  { view: 'library', label: 'Library', icon: LibraryBooksRoundedIcon },
  { view: 'contest', label: 'Contest', icon: MilitaryTechRoundedIcon },
  { view: 'quests', label: 'Quests', icon: EmojiEventsRoundedIcon },
  { view: 'explore', label: 'Explore', icon: ExploreRoundedIcon },
  { view: 'plans', label: 'Study Plan', icon: SchoolRoundedIcon },
  { view: 'leaderboard', label: 'Leaderboard', icon: LeaderboardRoundedIcon },
  { view: 'friends', label: 'Friends', icon: PeopleAltRoundedIcon },
];

// Red pill with the number of friend requests waiting for me.
function RequestBadge({ n: requests }) {
  // friend requests + unread chat messages, both live
  const unread = useSelector((s) => Object.values(s.friends.unread).reduce((a, c) => a + c, 0));
  const n = (requests || 0) + unread;
  if (!n) return null;
  return (
    <Box component="span" aria-label={`${n} friend notifications`} sx={{ minWidth: 20, height: 20, px: 0.6, borderRadius: 10, bgcolor: 'error.main', color: 'error.contrastText', fontSize: 12, fontWeight: 700, display: 'grid', placeItems: 'center' }}>
      {n}
    </Box>
  );
}

function NavButton({ active, icon: Icon, label, count, accent, onClick, trailing }) {
  return (
    <ButtonBase
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      sx={(t) => ({
        width: '100%',
        justifyContent: 'flex-start',
        gap: 1.5,
        px: 1.5,
        py: 1.1,
        borderRadius: '10px',
        textAlign: 'left',
        fontFamily: 'inherit',
        color: active ? t.palette.text.primary : t.palette.text.secondary,
        bgcolor: active ? alpha(t.palette.primary.main, t.palette.mode === 'dark' ? 0.16 : 0.1) : 'transparent',
        boxShadow: active ? `inset 3px 0 0 ${t.palette.primary.main}` : 'none',
        '&:hover': { bgcolor: active ? undefined : t.palette.action.hover, color: t.palette.text.primary },
        '&.Mui-focusVisible': { outline: `2px solid ${t.palette.primary.main}`, outlineOffset: 1 },
      })}
    >
      <Icon sx={{ fontSize: 20, color: accent || (active ? 'primary.main' : 'inherit') }} />
      <Typography variant="body2" noWrap sx={{ flex: 1, fontWeight: active ? 700 : 600 }}>
        {label}
      </Typography>
      {count !== undefined && (
        <Typography variant="caption" color="text.secondary" sx={{ fontVariantNumeric: 'tabular-nums' }}>
          {count}
        </Typography>
      )}
      {trailing}
    </ButtonBase>
  );
}

// Desktop: vertical rail. Phones reach the same sections from the navigation menu.
export default function DashboardSidebar({ view, activeListId, lists, onView, onSelectList, onCreateList, maxLists, friendCounts }) {
  const [creating, setCreating] = useState(false);

  return (
    <>
      {/* Desktop rail */}
      <Box component="nav" aria-label="Dashboard sections" sx={{ display: { xs: 'none', md: 'flex' }, flexDirection: 'column', gap: 0.5 }}>
        {NAV_ITEMS.map(({ view: v, label, icon }) => (
          <NavButton
            key={v}
            active={view === v}
            icon={icon}
            label={label}
            count={v === 'friends' ? friendCounts?.friends : undefined}
            trailing={v === 'friends' ? <RequestBadge n={friendCounts?.incoming} /> : null}
            onClick={() => onView(v)}
          />
        ))}

        <Box sx={{ mt: 2.5, mb: 0.5, px: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 700 }}>
            My Lists
          </Typography>
          <Tooltip title={lists.length >= maxLists ? 'List limit reached' : 'New list'}>
            <span>
              <IconButton size="small" onClick={() => setCreating(true)} disabled={lists.length >= maxLists} aria-label="Create a list">
                <AddRoundedIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        </Box>

        {lists.map((l) => (
          <NavButton
            key={l.id}
            active={view === 'list' && activeListId === l.id}
            icon={l.id === 'favorite' ? StarRoundedIcon : ListAltRoundedIcon}
            accent={l.id === 'favorite' ? '#F59E0B' : undefined}
            label={l.name}
            count={l.items.length}
            onClick={() => onSelectList(l.id)}
            trailing={
              l.id === 'favorite' ? (
                <Tooltip title="Lists are saved on this device">
                  <LockRoundedIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                </Tooltip>
              ) : null
            }
          />
        ))}
      </Box>

      <NameDialog
        open={creating}
        title="Create a list"
        confirmLabel="Create"
        onClose={() => setCreating(false)}
        onConfirm={(name) => {
          const id = onCreateList(name);
          if (!id) return false;
          onSelectList(id);
          return true;
        }}
      />
    </>
  );
}
