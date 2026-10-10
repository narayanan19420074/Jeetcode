import { Suspense, lazy, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link as RouterLink, Navigate, useParams } from 'react-router-dom';
import { alpha } from '@mui/material/styles';
import { Avatar, Box, Button, CircularProgress, InputAdornment, List, ListItemButton, ListItemIcon, ListItemText, Stack, TextField, Typography } from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import { SETTINGS_GROUPS, SETTINGS_ITEMS, DEFAULT_SECTION } from './settingsNav';
import { initialsFromName } from './components/SettingsUi';

// Each section is its own chunk — opening Settings stays light.
const SECTIONS = {
  profile: lazy(() => import('./sections/ProfileSection')),
  account: lazy(() => import('./sections/AccountSection')),
  billing: lazy(() => import('./sections/BillingSection')),
  appearance: lazy(() => import('./sections/AppearanceSection')),
  accessibility: lazy(() => import('./sections/AccessibilitySection')),
  editor: lazy(() => import('./sections/EditorSection')),
  notifications: lazy(() => import('./sections/NotificationsSection')),
  password: lazy(() => import('./sections/PasswordSection')),
  sessions: lazy(() => import('./sections/SessionsSection')),
  'security-log': lazy(() => import('./sections/SecurityLogSection')),
};

function NavItem({ item, active }) {
  const Icon = item.icon;
  return (
    <ListItemButton
      component={RouterLink}
      to={`/settings/${item.key}`}
      selected={active}
      aria-current={active ? 'page' : undefined}
      sx={(t) => ({
        borderRadius: '8px',
        gap: 1.25,
        px: 1.25,
        py: 0.9,
        position: 'relative',
        '&.Mui-selected': { bgcolor: alpha(t.palette.primary.main, t.palette.mode === 'dark' ? 0.16 : 0.1), color: 'primary.main', '&:hover': { bgcolor: alpha(t.palette.primary.main, t.palette.mode === 'dark' ? 0.2 : 0.14) } },
        '&.Mui-selected::before': { content: '""', position: 'absolute', left: -10, top: 8, bottom: 8, width: 3, borderRadius: 3, bgcolor: 'primary.main' },
      })}
    >
      <ListItemIcon sx={{ minWidth: 0, color: 'inherit' }}>
        <Icon sx={{ fontSize: 20 }} />
      </ListItemIcon>
      <ListItemText primary={item.label} slotProps={{ primary: { sx: { fontSize: '0.875rem', fontWeight: active ? 700 : 500 } } }} />
    </ListItemButton>
  );
}

export default function SettingsPage() {
  const user = useSelector((s) => s.auth.user);
  const params = useParams();
  const section = params['*']?.split('/')[0] || '';
  const [query, setQuery] = useState('');

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return SETTINGS_GROUPS;
    return SETTINGS_GROUPS.map((g) => ({
      ...g,
      items: g.items.filter((i) => `${i.label} ${i.keywords}`.toLowerCase().includes(q)),
    })).filter((g) => g.items.length);
  }, [query]);

  if (!user) return null;
  if (!SECTIONS[section]) return <Navigate to={`/settings/${DEFAULT_SECTION}`} replace />;
  const Section = SECTIONS[section];
  const current = SETTINGS_ITEMS.find((i) => i.key === section);

  return (
    <Box sx={{ maxWidth: 1120, mx: 'auto', px: { xs: 2, md: 3 }, py: { xs: 2.5, md: 4 } }}>
      {/* Header — who these settings belong to */}
      <Stack direction="row" sx={{ alignItems: 'center', gap: 1.75, mb: { xs: 2, md: 3.5 } }}>
        <Avatar src={user.avatarUrl || undefined} alt="" sx={{ width: 48, height: 48, bgcolor: 'primary.main', color: 'primary.contrastText', fontWeight: 700 }}>
          {initialsFromName(user.name)}
        </Avatar>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography sx={{ fontWeight: 800, lineHeight: 1.25 }} noWrap>
            {user.name}{' '}
            <Typography component="span" color="text.secondary" sx={{ fontWeight: 500 }}>
              @{user.handle}
            </Typography>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Your personal account
          </Typography>
        </Box>
        <Button component={RouterLink} to="/dashboard" size="small" variant="outlined" startIcon={<ArrowBackRoundedIcon />} sx={{ display: { xs: 'none', sm: 'inline-flex' }, color: 'text.primary', borderColor: 'divider' }}>
          Back to dashboard
        </Button>
      </Stack>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: '264px minmax(0, 1fr)' }, gap: { xs: 2, md: 5 }, alignItems: 'start' }}>
        {/* Phones: a swipeable strip instead of the sidebar */}
        <Box
          component="nav"
          aria-label="Settings sections"
          sx={{ display: { xs: 'flex', md: 'none' }, gap: 1, overflowX: 'auto', pb: 0.5, mx: -2, px: 2, scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' } }}
        >
          {SETTINGS_ITEMS.map((i) => {
            const Icon = i.icon;
            const active = i.key === section;
            return (
              <Button
                key={i.key}
                component={RouterLink}
                to={`/settings/${i.key}`}
                size="small"
                variant={active ? 'contained' : 'outlined'}
                disableElevation
                startIcon={<Icon sx={{ fontSize: 18 }} />}
                sx={{ flexShrink: 0, borderRadius: 99, whiteSpace: 'nowrap', ...(active ? {} : { color: 'text.primary', borderColor: 'divider' }) }}
              >
                {i.label}
              </Button>
            );
          })}
        </Box>

        {/* Desktop sidebar */}
        <Box component="nav" aria-label="Settings sections" sx={{ display: { xs: 'none', md: 'block' }, position: 'sticky', top: 88 }}>
          <TextField
            size="small"
            fullWidth
            placeholder="Find a setting"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            slotProps={{
              input: { startAdornment: <InputAdornment position="start"><SearchRoundedIcon fontSize="small" /></InputAdornment> },
              htmlInput: { 'aria-label': 'Find a setting' },
            }}
            sx={{ mb: 2 }}
          />
          {groups.length === 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ px: 1 }}>
              No settings match “{query}”.
            </Typography>
          )}
          {groups.map((g) => (
            <Box key={g.label} sx={{ mb: 2 }}>
              <Typography variant="overline" color="text.secondary" sx={{ px: 1.25, fontWeight: 700, letterSpacing: '0.08em', lineHeight: 2 }}>
                {g.label}
              </Typography>
              <List disablePadding sx={{ display: 'grid', gap: 0.25, pl: 1.25 }}>
                {g.items.map((i) => (
                  <NavItem key={i.key} item={i} active={i.key === section} />
                ))}
              </List>
            </Box>
          ))}
        </Box>

        {/* Content */}
        <Box component="main" sx={{ minWidth: 0, maxWidth: 780 }} aria-label={current?.label}>
          <Suspense
            fallback={
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                <CircularProgress />
              </Box>
            }
          >
            <Section key={section} />
          </Suspense>
        </Box>
      </Box>
    </Box>
  );
}
