import { Suspense, lazy, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link as RouterLink, Navigate, useParams } from 'react-router-dom';
import { alpha } from '@mui/material/styles';
import { Avatar, Box, Button, ButtonBase, CircularProgress, IconButton, InputAdornment, List, ListItemButton, ListItemIcon, ListItemText, Stack, TextField, Typography, useMediaQuery } from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import BackToDashboard from '../../components/BackToDashboard';
import { SETTINGS_GROUPS, SETTINGS_ITEMS, DEFAULT_SECTION } from './settingsNav';
import { initialsFromName } from './components/SettingsUi';
import { tint } from '../dashboard/dashboardUtils';

const ACCENT = '#6366F1';
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

// Phone layout of Settings. It follows the phone Problems, Dashboard and You pages: same page padding,
// 44px icon buttons, tinted search pill, centred header, 1.25rem section titles and divider-separated rows.
function PhoneRow({ to, title, subtitle, leading }) {
  return (
    <ButtonBase
      component={RouterLink}
      to={to}
      sx={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        gap: 1.5,
        py: 1.5,
        pl: 0.5,
        textAlign: 'left',
        fontFamily: 'inherit',
        color: 'inherit',
        borderBottom: '1px solid',
        borderColor: 'divider',
        '&:last-of-type': { borderBottom: 'none' },
      }}
    >
      {leading}
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography noWrap sx={{ fontWeight: 700, fontSize: '1rem', lineHeight: 1.35 }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography noWrap variant="body2" color="text.secondary" sx={{ mt: 0.4, fontSize: '0.82rem' }}>
            {subtitle}
          </Typography>
        )}
      </Box>
      <ChevronRightRoundedIcon sx={{ color: 'text.disabled', flexShrink: 0 }} />
    </ButtonBase>
  );
}

function PhoneMenu({ user, groups, query, setQuery }) {
  return (
    <Box sx={{ px: 1.75, pt: 'calc(8px + env(safe-area-inset-top))', pb: 2, maxWidth: 640, mx: 'auto' }}>
      {/* Back */}
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
        <BackToDashboard sx={{ width: 44, height: 44, border: 'none', bgcolor: 'transparent' }} />
      </Stack>

      {/* Search */}
      <TextField
        fullWidth
        size="small"
        placeholder="Find a setting"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        slotProps={{
          htmlInput: { 'aria-label': 'Find a setting' },
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchRoundedIcon fontSize="small" />
              </InputAdornment>
            ),
          },
        }}
        sx={(t) => ({
          mt: 1,
          '& .MuiOutlinedInput-root': { borderRadius: 999, height: 48, bgcolor: tint(ACCENT, t.palette.mode === 'dark' ? 16 : 9) },
          '& .MuiOutlinedInput-notchedOutline': { borderColor: 'transparent' },
        })}
      />

      {/* Header */}
      <Box sx={{ textAlign: 'center', mt: 2.5 }}>
        <Box
          sx={{
            width: 84,
            height: 84,
            mx: 'auto',
            borderRadius: '26px',
            display: 'grid',
            placeItems: 'center',
            color: '#fff',
            background: `linear-gradient(135deg, ${ACCENT}, color-mix(in srgb, ${ACCENT} 60%, #000))`,
            boxShadow: `0 14px 26px -12px ${ACCENT}`,
          }}
        >
          <SettingsRoundedIcon sx={{ fontSize: 44 }} />
        </Box>
        <Typography component="h1" noWrap sx={{ mt: 1.75, fontWeight: 800, fontSize: '1.9rem', lineHeight: 1.15, letterSpacing: '-0.01em' }}>
          Settings
        </Typography>
        <Typography color="text.secondary" sx={{ fontSize: '1rem', mt: 0.25 }}>
          Account and preferences
        </Typography>
      </Box>

      {/* Profile */}
      {!query.trim() && (
        <Box sx={{ mt: 3.5, borderTop: '1px solid', borderColor: 'divider' }}>
          <PhoneRow
            to="/settings/profile"
            title={user.name}
            subtitle={`@${user.handle}`}
            leading={
              <Avatar src={user.avatarUrl || undefined} alt="" sx={{ width: 48, height: 48, flexShrink: 0, bgcolor: 'primary.main', color: 'primary.contrastText', fontWeight: 800 }}>
                {initialsFromName(user.name)}
              </Avatar>
            }
          />
        </Box>
      )}

      {groups.length === 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
          No settings match “{query}”.
        </Typography>
      )}
      {groups.map((g) => {
        const color = GROUP_ACCENT[g.label] || ACCENT;
        return (
          <Box key={g.label} component="section" aria-label={g.label} sx={{ mt: 3.5 }}>
            <Typography component="h2" sx={{ fontWeight: 800, fontSize: '1.25rem', lineHeight: 1.15, letterSpacing: '-0.01em', mb: 1.5 }}>
              {g.label}
            </Typography>
            <Box sx={{ borderTop: '1px solid', borderColor: 'divider' }}>
              {g.items.map((i) => {
                const Icon = i.icon;
                return (
                  <PhoneRow
                    key={i.key}
                    to={`/settings/${i.key}`}
                    title={i.label}
                    leading={
                      <Box sx={(t) => ({ width: 48, height: 48, borderRadius: '14px', flexShrink: 0, display: 'grid', placeItems: 'center', bgcolor: tint(color, t.palette.mode === 'dark' ? 20 : 14), color })}>
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
        maxWidth: { xs: 640, md: 1120 },
        mx: 'auto',
        px: { xs: 1.75, md: 3 },
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
          <IconButton component={RouterLink} to="/settings" aria-label="Back to settings" sx={{ width: 44, height: 44 }}>
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
}
