import { Link as RouterLink } from 'react-router-dom';
import { Avatar, Box, IconButton, Stack, TextField, Typography } from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import { tint } from '../../dashboard/dashboardUtils';
import { HeaderTile, LIB_TRACKING, LibraryFont, useLibraryPalette } from '../../dashboard/components/libraryStyle';
import { initialsFromName } from '../components/SettingsUi';
import { accentFor } from '../common/settingsAccent';
import PhoneRow from './PhoneRow';
import { COLOR_PALETTE, FONT_SIZES, FONT_WEIGHTS } from '../../../app/design/designTokens';

function PhoneSearch({ query, setQuery, pal }) {
  return (
    <TextField
      fullWidth
      size="small"
      placeholder="Find a setting"
      value={query}
      onChange={(event) => setQuery(event.target.value)}
      slotProps={{ htmlInput: { 'aria-label': 'Find a setting' } }}
      sx={{ mt: 1, px: '4px', '& .MuiOutlinedInput-root': { borderRadius: 999, height: 44, bgcolor: pal.player, fontSize: FONT_SIZES.subheading, letterSpacing: LIB_TRACKING, px: '16px' }, '& .MuiOutlinedInput-notchedOutline': { borderColor: 'transparent' } }}
    />
  );
}

function PhoneHeader({ pal }) {
  return (
    <Box sx={{ textAlign: 'center', mt: 3 }}>
      <HeaderTile><SettingsRoundedIcon sx={{ fontSize: FONT_SIZES.displayLg, color: COLOR_PALETTE.white }} /></HeaderTile>
      <Typography component="h1" noWrap sx={{ mt: 1.5, fontWeight: FONT_WEIGHTS.bold, fontSize: FONT_SIZES.displayLg, lineHeight: '32px' }}>Settings</Typography>
      <Typography sx={{ fontSize: FONT_SIZES.subheading, lineHeight: '24px', letterSpacing: LIB_TRACKING, color: pal.muted }}>Account and preferences</Typography>
    </Box>
  );
}

function PhoneProfileRow({ user, pal }) {
  const avatar = (
    <Avatar src={user.avatarUrl || undefined} alt="" sx={{ width: 48, height: 48, flexShrink: 0, bgcolor: 'primary.main', color: 'primary.contrastText', fontWeight: FONT_WEIGHTS.bold }}>
      {initialsFromName(user.name)}
    </Avatar>
  );
  return (
    <Box sx={{ mt: 3, borderTop: `1px solid ${pal.divider}` }}>
      <PhoneRow to="/settings/profile" title={user.name} subtitle={`@${user.handle}`} leading={avatar} />
    </Box>
  );
}

function PhoneGroup({ group, pal }) {
  const color = accentFor(group.label);
  return (
    <Box component="section" aria-label={group.label} sx={{ mt: 4 }}>
      <Typography component="h2" sx={{ fontSize: FONT_SIZES.subheading, lineHeight: '24px', fontWeight: FONT_WEIGHTS.bold, mb: 1.5 }}>{group.label}</Typography>
      <Box sx={{ borderTop: `1px solid ${pal.divider}` }}>
        {group.items.map((item) => {
          const Icon = item.icon;
          const tile = (
            <Box aria-hidden sx={(theme) => ({ width: 48, height: 48, borderRadius: '14px', flexShrink: 0, display: 'grid', placeItems: 'center', bgcolor: tint(color, theme.palette.mode === 'dark' ? 20 : 14), color })}>
              <Icon />
            </Box>
          );
          return <PhoneRow key={item.key} to={`/settings/${item.key}`} title={item.label} leading={tile} />;
        })}
      </Box>
    </Box>
  );
}

// Phone layout of Settings in the Library look (same as the phone Problems, Home and You pages):
// Roboto type, warm surface, pill search, centred header tile and divider-separated rows.
export default function PhoneMenu({ user, groups, query, setQuery }) {
  const pal = useLibraryPalette();
  return (
    <LibraryFont>
      <Box sx={{ px: 2, pt: 'calc(8px + env(safe-area-inset-top))', pb: 2, maxWidth: 640, mx: 'auto' }}>
        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <IconButton component={RouterLink} to="/dashboard" aria-label="Back to dashboard" sx={{ width: 44, height: 44, ml: -1, color: pal.text }}><ArrowBackRoundedIcon /></IconButton>
        </Stack>
        <PhoneSearch query={query} setQuery={setQuery} pal={pal} />
        <PhoneHeader pal={pal} />
        {!query.trim() && <PhoneProfileRow user={user} pal={pal} />}
        {groups.length === 0 && <Typography sx={{ py: 3, textAlign: 'center', fontSize: FONT_SIZES.title, color: pal.muted }}>No settings match “{query}”.</Typography>}
        {groups.map((group) => <PhoneGroup key={group.label} group={group} pal={pal} />)}
      </Box>
    </LibraryFont>
  );
}
