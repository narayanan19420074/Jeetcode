import { Suspense, lazy, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link as RouterLink, Navigate, useParams } from 'react-router-dom';
import { alpha } from '@mui/material/styles';
import { Avatar, Box, Button, ButtonBase, CircularProgress, IconButton, InputAdornment, List, ListItemButton, ListItemIcon, ListItemText, Stack, TextField, Typography, useMediaQuery } from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import { SETTINGS_GROUPS, SETTINGS_ITEMS, DEFAULT_SECTION } from './settingsNav';
import { initialsFromName } from './components/SettingsUi';
import { tint } from '../dashboard/dashboardUtils';
import { HeaderTile, LibraryFont, useLibraryPalette } from '../dashboard/components/libraryStyle';

const TRACKING = '0.03em';
// Each settings group has its own accent colour, like the sections on the phone home screen.
const GROUP_ACCENT = { Access: '#6366F1', Preferences: '#F97316', Security: '#14B8A6' };

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

// Phone layout of Settings in the Library look (same as the phone Problems, Home and You pages):
// Roboto type, warm surface, pill search, centred header tile and divider-separated rows.
function PhoneRow({ to, title, subtitle, leading }) {
  const pal = useLibraryPalette();
  return (
    <ButtonBase
      component={RouterLink}
      to={to}
      sx={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        gap: '12px',
        py: 1.25,
        textAlign: 'left',
        fontFamily: 'inherit',
        color: pal.text,
        borderBottom: `1px solid ${pal.divider}`,
        '&:last-of-type': { borderBottom: 'none' },
      }}
    >
      {leading}
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography noWrap sx={{ fontSize: 16, lineHeight: '24px', letterSpacing: TRACKING }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography noWrap sx={{ fontSize: 14, lineHeight: '20px', letterSpacing: TRACKING, color: pal.muted }}>
            {subtitle}
          </Typography>
        )}
      </Box>
      <ChevronRightRoundedIcon aria-hidden sx={{ color: pal.muted, flexShrink: 0 }} />
    </ButtonBase>
  );
}

function PhoneMenu({ user, groups, query, setQuery }) {
  const pal = useLibraryPalette();
  return (
    <LibraryFont>
      <Box sx={{ px: 2, pt: 'calc(8px + env(safe-area-inset-top))', pb: 2, maxWidth: 640, mx: 'auto' }}>
        {/* Back */}
        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <IconButton component={RouterLink} to="/dashboard" aria-label="Back to dashboard" sx={{ width: 44, height: 44, ml: -1, color: pal.text }}>
            <ArrowBackRoundedIcon />
          </IconButton>
        </Stack>

        {/* Search */}
        <TextField
          fullWidth
          size="small"
          placeholder="Find a setting"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          slotProps={{ htmlInput: { 'aria-label': 'Find a setting' } }}
          sx={{
            mt: 1,
            px: '4px',
            '& .MuiOutlinedInput-root': { borderRadius: 999, height: 44, bgcolor: pal.player, fontSize: 18, letterSpacing: TRACKING, px: '16px' },
            '& .MuiOutlinedInput-notchedOutline': { borderColor: 'transparent' },
          }}
        />

        {/* Header */}
        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <HeaderTile>
            <SettingsRoundedIcon sx={{ fontSize: 28, color: '#fff' }} />
          </HeaderTile>
          <Typography component="h1" noWrap sx={{ mt: 1.5, fontWeight: 700, fontSize: 26, lineHeight: '32px' }}>
            Settings
          </Typography>
          <Typography sx={{ fontSize: 17, lineHeight: '24px', letterSpacing: TRACKING, color: pal.muted }}>Account and preferences</Typography>
        </Box>

        {/* Profile */}
        {!query.trim() && (
          <Box sx={{ mt: 3, borderTop: `1px solid ${pal.divider}` }}>
            <PhoneRow
              to="/settings/profile"
              title={user.name}
              subtitle={`@${user.handle}`}
              leading={
                <Avatar src={user.avatarUrl || undefined} alt="" sx={{ width: 48, height: 48, flexShrink: 0, bgcolor: 'primary.main', color: 'primary.contrastText', fontWeight: 700 }}>
                  {initialsFromName(user.name)}
                </Avatar>
              }
            />
          </Box>
        )}

        {groups.length === 0 && (
          <Typography sx={{ py: 3, textAlign: 'center', fontSize: 16, color: pal.muted }}>No settings match “{query}”.</Typography>
        )}
        {groups.map((g) => {
          const color = GROUP_ACCENT[g.label] || GROUP_ACCENT.Access;
          return (
            <Box key={g.label} component="section" aria-label={g.label} sx={{ mt: 4 }}>
              <Typography component="h2" sx={{ fontSize: 18, lineHeight: '24px', fontWeight: 700, mb: 1.5 }}>
                {g.label}
              </Typography>
              <Box sx={{ borderTop: `1px solid ${pal.divider}` }}>
                {g.items.map((i) => {
                  const Icon = i.icon;
                  return (
                    <PhoneRow
                      key={i.key}
                      to={`/settings/${i.key}`}
                      title={i.label}
                      leading={
                        <Box aria-hidden sx={(t) => ({ width: 48, height: 48, borderRadius: '14px', flexShrink: 0, display: 'grid', placeItems: 'center', bgcolor: tint(color, t.palette.mode === 'dark' ? 20 : 14), color })}>
                          <Icon />
                        </Box>
                      }
                    />
                  );
                })}
              </Box>
            </Box>
          );
        })}
      </Box>
    </LibraryFont>
  );
}

export default function SettingsPage() {
  const user = useSelector((s) => s.auth.user);
  const params = useParams();
  const section = params['*']?.split('/')[0] || '';
  const [query, setQuery] = useState('');
  const isPhone = useMediaQuery((t) => t.breakpoints.down('md'));
  const pal = useLibraryPalette();

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

  const page = (
    <Box
      ref={rootRef}
      sx={{
        maxWidth: { xs: 640, md: 1120 },
        mx: 'auto',
        px: { xs: 2, md: 3 },
        pt: { xs: 'calc(8px + env(safe-area-inset-top))', md: 4 },
        pb: { xs: 2, md: 4 },
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
        {/* Phones: back arrow only. The section shows its own title below. */}
        <Stack direction="row" sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center' }}>
          <IconButton component={RouterLink} to="/settings" aria-label="Back to settings" sx={{ width: 44, height: 44, ml: -1, color: pal.text }}>
            <ArrowBackRoundedIcon />
          </IconButton>
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
  // Phones get the Library type (Roboto) on section pages too; desktop keeps the app font.
  return isPhone ? <LibraryFont>{page}</LibraryFont> : page;
}
