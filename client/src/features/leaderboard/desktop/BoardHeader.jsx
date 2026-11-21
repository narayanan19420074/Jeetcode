import { useState } from 'react';
import { Box, Collapse, Skeleton, Typography } from '@mui/material';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import { useLibraryPalette } from '../../dashboard/components/libraryStyle';
import { FONT_SIZES, FONT_WEIGHTS, SIZES } from '../../../app/design/designTokens';
import { accentTileSx } from './lbLook';
import { PERIODS, TRACKS } from './boardOptions';
import { PeriodSwitch, RefreshButton, ScopeSwitch, SearchBox, SearchToggle, TrackTabs } from './BoardControls';

function subtitleOf({ meta, track, period, scope }) {
  const count = scope === 'friends' ? meta?.stats?.learners : meta?.totalUsers;
  const names = [TRACKS.find((o) => o.value === track)?.label, PERIODS.find((o) => o.value === period)?.label];
  if (count !== undefined && count !== null) names.push(`${count.toLocaleString()} ${scope === 'friends' ? 'on this board' : 'players'}`);
  return names.join(', ');
}

function BoardTitle({ meta, roomy, ...filters }) {
  const pal = useLibraryPalette();
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1, minWidth: SIZES.flexShrinkMinWidth }}>
      <Box sx={accentTileSx(SIZES.leaderboard.headerIcon)}><EmojiEventsRoundedIcon /></Box>
      <Box sx={{ minWidth: SIZES.flexShrinkMinWidth }}>
        <Typography component="h2" noWrap sx={{ fontSize: FONT_SIZES.heading, fontWeight: FONT_WEIGHTS.bold, lineHeight: 1.2 }}>Leaderboard</Typography>
        {roomy && (meta ? <Typography noWrap sx={{ fontSize: FONT_SIZES.caption, color: pal.muted }}>{subtitleOf({ meta, ...filters })}</Typography> : <Skeleton width={SIZES.leaderboard.searchWidth} />)}
      </Box>
    </Box>
  );
}

function TitleRow({ roomy, search, setSearch, searchOpen, toggleSearch, isAuthenticated, scope, onScope, reload, ...rest }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
      <BoardTitle roomy={roomy} scope={scope} {...rest} />
      {roomy && <SearchBox value={search} onChange={setSearch} width={SIZES.leaderboard.searchWidth} />}
      <ScopeSwitch value={scope} onChange={onScope} friendsOk={isAuthenticated} />
      {roomy ? <RefreshButton onClick={reload} /> : <SearchToggle open={searchOpen} onToggle={toggleSearch} />}
    </Box>
  );
}

// Title, search and "Everyone / Friends" on the first row; track and period pills on the second.
export default function BoardHeader({ layout, search, setSearch, onTrack, onPeriod, reload, ...props }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const toggleSearch = () => { if (searchOpen) setSearch(''); setSearchOpen((open) => !open); };
  const { roomy, iconOnly } = layout;
  return (
    <Box sx={{ display: 'grid', gap: 1.5 }}>
      <TitleRow roomy={roomy} search={search} setSearch={setSearch} searchOpen={searchOpen} toggleSearch={toggleSearch} reload={reload} {...props} />
      {!roomy && <Collapse in={searchOpen}><SearchBox value={search} onChange={setSearch} /></Collapse>}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5 }}>
        <TrackTabs value={props.track} onChange={onTrack} iconOnly={iconOnly} />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PeriodSwitch value={props.period} onChange={onPeriod} iconOnly={iconOnly} />
          {!roomy && <RefreshButton onClick={reload} />}
        </Box>
      </Box>
    </Box>
  );
}
