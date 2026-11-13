import { useNavigate } from 'react-router-dom';
import { Box, InputAdornment, TextField, Typography } from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import { LIB_TRACKING, useLibraryPalette } from '../../dashboard/components/libraryStyle';
import { accentFor } from '../common/settingsAccent';
import { NavButton } from '../../dashboard/components/SidebarParts';
import SidebarItem from './SidebarItem';
import { FONT_SIZES, FONT_WEIGHTS, RADII_PX } from '../../../app/design/designTokens';

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
      sx={{ mb: 2.5, '& .MuiOutlinedInput-root': { borderRadius: RADII_PX.pill, height: 44, bgcolor: palette.player, fontSize: FONT_SIZES.title, letterSpacing: LIB_TRACKING, px: 2 }, '& .MuiOutlinedInput-notchedOutline': { borderColor: 'transparent' } }}
    />
  );
}

function BackLink() {
  const navigate = useNavigate();
  return <NavButton active={false} icon={ArrowBackRoundedIcon} label="Back to Dashboard" onClick={() => navigate('/dashboard')} />;
}

// The way back, a search and the settings groups. The sidebar column of the page frame scrolls them when they are taller than the window.
export default function SettingsSidebar({ groups, section, query, setQuery }) {
  const palette = useLibraryPalette();
  return (
    <Box component="nav" aria-label="Settings sections">
      <Box sx={{ mb: 1 }}>
        <BackLink />
      </Box>
      <SidebarSearch query={query} setQuery={setQuery} palette={palette} />
      {groups.length === 0 && <Typography sx={{ px: 1, fontSize: FONT_SIZES.bodyLg, color: palette.muted }}>No settings match “{query}”.</Typography>}
      {groups.map((group) => (
        <Box key={group.label} sx={{ mb: 2.5 }}>
          <Typography component="h2" sx={{ px: 1, mb: 1, fontSize: FONT_SIZES.title, lineHeight: '24px', fontWeight: FONT_WEIGHTS.bold }}>{group.label}</Typography>
          <Box sx={{ display: 'grid', gap: 0.5 }}>
            {group.items.map((item) => <SidebarItem key={item.key} item={item} accent={accentFor(group.label)} active={item.key === section} />)}
          </Box>
        </Box>
      ))}
    </Box>
  );
}
