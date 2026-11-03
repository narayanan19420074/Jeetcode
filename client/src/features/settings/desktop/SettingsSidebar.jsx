import { Box, InputAdornment, TextField, Typography } from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import { LIB_TRACKING, useLibraryPalette } from '../../dashboard/components/libraryStyle';
import { accentFor } from '../common/settingsAccent';
import SidebarItem from './SidebarItem';

function SidebarSearch({ query, setQuery, palette }) {
  return (
    <TextField
      size="small"
      fullWidth
      placeholder="Find a setting"
      value={query}
      onChange={(event) => setQuery(event.target.value)}
      slotProps={{
        input: { startAdornment: <InputAdornment position="start"><SearchRoundedIcon fontSize="small" /></InputAdornment> },
        htmlInput: { 'aria-label': 'Find a setting' },
      }}
      sx={{ mb: 2.5, '& .MuiOutlinedInput-root': { borderRadius: 999, height: 44, bgcolor: palette.player, fontSize: 16, letterSpacing: LIB_TRACKING, px: 2 }, '& .MuiOutlinedInput-notchedOutline': { borderColor: 'transparent' } }}
    />
  );
}

// Search plus the settings groups. `fill` = the page is one window tall, so the sidebar scrolls by itself.
export default function SettingsSidebar({ groups, section, query, setQuery, fill }) {
  const palette = useLibraryPalette();
  return (
    <Box component="nav" aria-label="Settings sections" sx={fill ? { minHeight: 0, overflowY: 'auto', pr: 1, pb: 1 } : { position: 'sticky', top: 88 }}>
      <SidebarSearch query={query} setQuery={setQuery} palette={palette} />
      {groups.length === 0 && <Typography sx={{ px: 1, fontSize: 15, color: palette.muted }}>No settings match “{query}”.</Typography>}
      {groups.map((group) => (
        <Box key={group.label} sx={{ mb: 2.5 }}>
          <Typography component="h2" sx={{ px: 1, mb: 0.75, fontSize: 16, lineHeight: '24px', fontWeight: 700 }}>{group.label}</Typography>
          <Box sx={{ display: 'grid', gap: 0.25 }}>
            {group.items.map((item) => <SidebarItem key={item.key} item={item} accent={accentFor(group.label)} active={item.key === section} />)}
          </Box>
        </Box>
      ))}
    </Box>
  );
}
