import { useState } from 'react';
import { Box, Tooltip } from '@mui/material';
import LibraryBooksRoundedIcon from '@mui/icons-material/LibraryBooksRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import MilitaryTechRoundedIcon from '@mui/icons-material/MilitaryTechRounded';
import ExploreRoundedIcon from '@mui/icons-material/ExploreRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import LeaderboardRoundedIcon from '@mui/icons-material/LeaderboardRounded';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import ListAltRoundedIcon from '@mui/icons-material/ListAltRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import { NameDialog } from './ListDialogs';
import { ListsHeader, NavButton, RequestBadge } from './SidebarParts';
import { COLOR_PALETTE, FONT_SIZES } from '../../../app/design/designTokens';

export const NAV_ITEMS = [
  { view: 'library', label: 'Library', icon: LibraryBooksRoundedIcon },
  { view: 'contest', label: 'Contest', icon: MilitaryTechRoundedIcon },
  { view: 'quests', label: 'Quests', icon: EmojiEventsRoundedIcon },
  { view: 'explore', label: 'Explore', icon: ExploreRoundedIcon },
  { view: 'plans', label: 'Study Plan', icon: SchoolRoundedIcon },
  { view: 'leaderboard', label: 'Leaderboard', icon: LeaderboardRoundedIcon },
  { view: 'friends', label: 'Friends', icon: PeopleAltRoundedIcon },
];

// Same blue star as the Favorites card on the phone home.
const FAVORITE_STAR = COLOR_PALETTE.custom.blue3F8CE8;

function ViewButtons({ view, onView, friendCounts }) {
  return NAV_ITEMS.map(({ view: v, label, icon }) => (
    <NavButton
      key={v}
      active={view === v}
      icon={icon}
      label={label}
      count={v === 'friends' ? friendCounts?.friends : undefined}
      trailing={v === 'friends' ? <RequestBadge requests={friendCounts?.incoming} /> : null}
      onClick={() => onView(v)}
    />
  ));
}

function ListButtons({ lists, view, activeListId, onSelectList }) {
  return lists.map((l) => {
    const isFavorite = l.id === 'favorite';
    return (
      <NavButton
        key={l.id}
        active={view === 'list' && activeListId === l.id}
        icon={isFavorite ? StarRoundedIcon : ListAltRoundedIcon}
        accent={isFavorite ? FAVORITE_STAR : undefined}
        label={l.name}
        count={l.items.length}
        onClick={() => onSelectList(l.id)}
        trailing={
          isFavorite ? (
            <Tooltip title="Lists are saved on this device">
              <LockRoundedIcon sx={{ fontSize: FONT_SIZES.body, color: 'text.disabled' }} />
            </Tooltip>
          ) : null
        }
      />
    );
  });
}

// Desktop: vertical rail. Phones reach the same sections from the navigation menu.
export default function DashboardSidebar({ view, activeListId, lists, onView, onSelectList, onCreateList, maxLists, friendCounts }) {
  const [creating, setCreating] = useState(false);

  const createList = (name) => {
    const id = onCreateList(name);
    if (!id) return false;
    onSelectList(id);
    return true;
  };

  return (
    <>
      <Box component="nav" aria-label="Dashboard sections" sx={{ display: { xs: 'none', md: 'flex' }, flexDirection: 'column', gap: 0 }}>
        <ViewButtons view={view} onView={onView} friendCounts={friendCounts} />
        <ListsHeader atLimit={lists.length >= maxLists} onCreate={() => setCreating(true)} />
        <ListButtons lists={lists} view={view} activeListId={activeListId} onSelectList={onSelectList} />
      </Box>
      <NameDialog open={creating} title="Create a list" confirmLabel="Create" onClose={() => setCreating(false)} onConfirm={createList} />
    </>
  );
}
