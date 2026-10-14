import { Suspense, lazy, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link as RouterLink, Navigate, useParams } from 'react-router-dom';
import { alpha } from '@mui/material/styles';
import { Avatar, Box, Button, CircularProgress, Divider, IconButton, InputAdornment, List, ListItemButton, ListItemIcon, ListItemText, Stack, TextField, Typography, useMediaQuery } from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
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

// Phone row, GPay style: blue icon, label, soft chevron.
function PhoneRow({ item }) {
  const Icon = item.icon;
  return (
    <ListItemButton
      component={RouterLink}
      to={`/settings/${item.key}`}
      sx={{ minHeight: 60, px: 2, gap: 2, borderRadius: '16px', '&:active': { bgcolor: 'action.selected' } }}
    >
      <ListItemIcon sx={{ minWidth: 0, color: 'primary.main' }}>
        <Icon sx={{ fontSize: 26 }} />
      </ListItemIcon>
      <ListItemText primary={item.label} slotProps={{ primary: { sx: { fontSize: '1.05rem', fontWeight: 500 } } }} />
      <ChevronRightRoundedIcon sx={{ color: 'text.secondary', fontSize: 22 }} />
    </ListItemButton>
  );
}

// Phone landing screen: big title, profile card, search, then grouped rows split by dividers.
function PhoneMenu({ user, groups, query, setQuery }) {
  return (
    <Box sx={{ maxWidth: 560, mx: 'auto', px: 1.5, pt: 1, pb: 3 }}>
      <Stack direction="row" sx={{ alignItems: 'center', gap: 0.5, px: 0.5 }}>
        <IconButton component={RouterLink} to="/dashboard" aria-label="Back to dashboard" edge="start">
          <ArrowBackRoundedIcon />
        </IconButton>
      </Stack>
      <Typography variant="h4" sx={{ fontWeight: 500, px: 1.5, mt: 1, mb: 2.5, letterSpacing: '-0.01em' }}>
        Settings
      </Typography>

      <Box
        component={RouterLink}
        to="/settings/profile"
        sx={(t) => ({
          display: 'flex',
          alignItems: 'center',
          gap: 1.75,
          p: 2,
          mb: 2,
          borderRadius: '24px',
          textDecoration: 'none',
          color: 'inherit',
          bgcolor: alpha(t.palette.primary.main, t.palette.mode === 'dark' ? 0.18 : 0.12),
        })}
      >
        <Avatar src={user.avatarUrl || undefined} alt="" sx={{ width: 56, height: 56, bgcolor: 'primary.main', color: 'primary.contrastText', fontWeight: 700 }}>
          {initialsFromName(user.name)}
        </Avatar>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography noWrap sx={{ fontWeight: 800, fontSize: '1.05rem' }}>
            {user.name}
          </Typography>
          <Typography variant="body2" color="text.secondary" noWrap>
            @{user.handle}
          </Typography>
        </Box>
        <ChevronRightRoundedIcon sx={{ color: 'text.secondary' }} />
      </Box>

      <TextField
        fullWidth
        placeholder="Find a setting"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        slotProps={{
          input: { startAdornment: <InputAdornment position="start"><SearchRoundedIcon /></InputAdornment>, sx: { borderRadius: 99 } },
          htmlInput: { 'aria-label': 'Find a setting' },
        }}
        sx={{ mb: 1.5 }}
      />

      {groups.length === 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ px: 1.5, py: 2 }}>
          No settings match “{query}”.
        </Typography>
      )}
      {groups.map((g, gi) => (
        <Box key={g.label}>
          {gi > 0 && <Divider sx={{ my: 1 }} />}
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', px: 2, pt: 1, pb: 0.5, fontWeight: 800, letterSpacing: 0.6, textTransform: 'uppercase' }}>
            {g.label}
          </Typography>
          <List disablePadding>
            {g.items.map((i) => (
              <PhoneRow key={i.key} item={i} />
            ))}
          </List>
        </Box>
      ))}
    </Box>
  );
}

export default function SettingsPage() {
  const user = useSelector((s) => s.auth.user);
  const params = useParams();
  const section = params['*']?.split('/')[0] || '';
  const [query, setQuery] = useState('');
  const isPhone = useMediaQuery((t) => t.breakpoints.down('md'));

  // Desktop: the page itself never scrolls — the sidebar and the content pane
  // each get their own scrollbar. Height = whatever is left under the navbar
  // (and the free-access banner, if it is showing).
  const rootRef = useRef(null);
  const [fillH, setFillH] = useState(null);
  useLayoutEffect(() => {
    const el = rootRef.current;
    if (isPhone || !el) {
      setFillH(null);
      return undefined;
    }
    const measure = () => {
      const top = el.getBoundingClientRect().top + window.scrollY;
      setFillH(Math.max(420, Math.round(window.innerHeight - top)));
    };
    measure();
    window.addEventListener('resize', measure);
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null;
    ro?.observe(document.body);
    return () => {
      window.removeEventListener('resize', measure);
      ro?.disconnect();
    };
  }, [isPhone, section, user]);

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return SETTINGS_GROUPS;
    return SETTINGS_GROUPS.map((g) => ({
      ...g,
      items: g.items.filter((i) => `${i.label} ${i.keywords}`.toLowerCase().includes(q)),
    })).filter((g) => g.items.length);
  }, [query]);

  if (!user) return null;
  // Phones land on the settings list; desktop jumps straight into a section.
  if (isPhone && !section) return <PhoneMenu user={user} groups={groups} query={query} setQuery={setQuery} />;
  if (!SECTIONS[section]) return <Navigate to={isPhone ? '/settings' : `/settings/${DEFAULT_SECTION}`} replace />;
  const Section = SECTIONS[section];
  const current = SETTINGS_ITEMS.find((i) => i.key === section);

  return (
    <Box
      ref={rootRef}
      sx={{
        maxWidth: 1120,
        mx: 'auto',
        px: { xs: 2, md: 3 },
        py: { xs: 2.5, md: 4 },
        ...(fillH && { height: fillH, display: 'flex', flexDirection: 'column', overflow: 'hidden', pt: 3, pb: 2 }),
      }}
    >
      {/* Header — who these settings belong to */}
      <Stack direction="row" sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1.75, mb: 3.5, flexShrink: 0 }}>
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

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: '264px minmax(0, 1fr)' },
          gap: { xs: 2, md: 5 },
          alignItems: 'start',
          ...(fillH && { flex: 1, minHeight: 0, gridTemplateRows: 'minmax(0, 1fr)', alignItems: 'stretch' }),
        }}
      >
        {/* Phones: back arrow + big title instead of the sidebar */}
        <Stack direction="row" sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', gap: 1, mx: -1 }}>
          <IconButton component={RouterLink} to="/settings" aria-label="Back to settings">
            <ArrowBackRoundedIcon />
          </IconButton>
          <Typography variant="h5" sx={{ fontWeight: 500 }}>
            {current?.label}
          </Typography>
        </Stack>

        {/* Desktop sidebar */}
        <Box component="nav" aria-label="Settings sections" sx={{ display: { xs: 'none', md: 'block' }, ...(fillH ? { minHeight: 0, overflowY: 'auto', pr: 1, pb: 1 } : { position: 'sticky', top: 88 }) }}>
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
        <Box key={section} component="main" sx={{ minWidth: 0, maxWidth: 780, ...(fillH && { minHeight: 0, overflowY: 'auto', pr: 1.5, pb: 3 }) }} aria-label={current?.label}>
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
