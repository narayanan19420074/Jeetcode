import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSnackbar } from 'notistack';
import { alpha } from '@mui/material/styles';
import { Box, Typography, Stack, Switch, Chip, Divider } from '@mui/material';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import { usersApi } from '../../../api/usersApi';
import { extractErrorMessage } from '../../../api/apiClient';
import { userUpdated } from '../../auth/authSlice';
import { setUiPrefs } from '../../../app/uiSlice';

/* ------------------------------------------------------------------ */
/* Layout atoms                                                       */
/* ------------------------------------------------------------------ */

export function PageTitle({ title, description, action }) {
  return (
    <Box sx={{ mb: 3 }}>
      <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}>
        <Box>
          <Typography variant="h5" component="h1" sx={{ fontWeight: 800, letterSpacing: '-0.01em' }}>
            {title}
          </Typography>
          {description && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, maxWidth: 560 }}>
              {description}
            </Typography>
          )}
        </Box>
        {action}
      </Stack>
      <Divider sx={{ mt: 2.5 }} />
    </Box>
  );
}

// A bordered group of settings. tone="danger" gives the red GitHub-style frame.
export function Card({ title, description, children, tone = 'default', sx }) {
  const danger = tone === 'danger';
  return (
    <Box
      component="section"
      sx={(t) => ({
        mb: 3,
        border: '1px solid',
        borderColor: danger ? alpha(t.palette.error.main, 0.55) : 'divider',
        borderRadius: '12px',
        bgcolor: 'background.paper',
        overflow: 'hidden',
        ...sx,
      })}
    >
      {(title || description) && (
        <Box sx={(t) => ({ px: { xs: 2, sm: 3 }, py: 2, borderBottom: '1px solid', borderColor: danger ? alpha(t.palette.error.main, 0.35) : 'divider', bgcolor: danger ? alpha(t.palette.error.main, 0.06) : 'transparent' })}>
          {title && (
            <Typography variant="subtitle1" component="h2" sx={{ fontWeight: 700, color: danger ? 'error.main' : 'text.primary' }}>
              {title}
            </Typography>
          )}
          {description && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
              {description}
            </Typography>
          )}
        </Box>
      )}
      <Box>{children}</Box>
    </Box>
  );
}

// Padded body for free-form content inside a Card.
export function CardBody({ children, sx }) {
  return <Box sx={{ px: { xs: 2, sm: 3 }, py: 2.5, ...sx }}>{children}</Box>;
}

// Title + description on the left, a control on the right; stacks on phones.
export function Row({ title, description, control, children, last }) {
  return (
    <Box sx={{ px: { xs: 2, sm: 3 }, py: 2, borderBottom: last ? 'none' : '1px solid', borderColor: 'divider', '&:last-of-type': { borderBottom: 'none' } }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ alignItems: { xs: 'stretch', sm: 'center' }, justifyContent: 'space-between', gap: { xs: 1.25, sm: 3 } }}>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography variant="body2" component="div" sx={{ fontWeight: 700 }}>
            {title}
          </Typography>
          {description && (
            <Typography variant="body2" component="div" color="text.secondary" sx={{ mt: 0.25, fontSize: '0.8125rem' }}>
              {description}
            </Typography>
          )}
        </Box>
        {control && <Box sx={{ flexShrink: 0 }}>{control}</Box>}
      </Stack>
      {children}
    </Box>
  );
}

export function SwitchRow({ title, description, checked, onChange, disabled, badge }) {
  return (
    <Row
      title={
        <Stack direction="row" component="span" sx={{ alignItems: 'center', gap: 1 }}>
          {title}
          {badge && <Chip size="small" label={badge} variant="outlined" sx={{ height: 20, fontSize: '0.68rem' }} />}
        </Stack>
      }
      description={description}
      control={<Switch checked={!!checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} slotProps={{ input: { 'aria-label': typeof title === 'string' ? title : undefined } }} />}
    />
  );
}

// Radio-style selectable tile (theme, density, text size…).
export function ChoiceCard({ selected, onClick, label, hint, children, sx }) {
  return (
    <Box
      component="button"
      type="button"
      role="radio"
      aria-checked={!!selected}
      onClick={onClick}
      sx={(t) => ({
        all: 'unset',
        boxSizing: 'border-box',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        p: 1.25,
        borderRadius: '12px',
        border: '2px solid',
        borderColor: selected ? 'primary.main' : 'divider',
        bgcolor: selected ? alpha(t.palette.primary.main, 0.07) : 'transparent',
        transition: t.transitions.create(['border-color', 'background-color']),
        '&:hover': { borderColor: selected ? 'primary.main' : alpha(t.palette.text.secondary, 0.6) },
        '&:focus-visible': { outline: `2px solid ${t.palette.primary.main}`, outlineOffset: 2 },
        ...sx,
      })}
    >
      {children}
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1.3 }}>
            {label}
          </Typography>
          {hint && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.3 }}>
              {hint}
            </Typography>
          )}
        </Box>
        {selected && <CheckRoundedIcon color="primary" sx={{ fontSize: 20, flexShrink: 0 }} />}
      </Stack>
    </Box>
  );
}

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */

export const initialsFromName = (name) =>
  (name || 'U')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');

export function relativeTime(date) {
  if (!date) return '—';
  const diff = Date.now() - new Date(date).getTime();
  const s = Math.round(diff / 1000);
  if (s < 45) return 'just now';
  const m = Math.round(s / 60);
  if (m < 60) return `${m} minute${m === 1 ? '' : 's'} ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} hour${h === 1 ? '' : 's'} ago`;
  const d = Math.round(h / 24);
  if (d < 30) return `${d} day${d === 1 ? '' : 's'} ago`;
  return new Date(date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export const formatDateTime = (date) =>
  date ? new Date(date).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : '—';

/* ------------------------------------------------------------------ */
/* Preferences: optimistic, debounced save to the account              */
/* ------------------------------------------------------------------ */

const DEFAULTS = {
  appearance: { theme: 'dark', accent: 'blue', density: 'comfortable', fontScale: 'md', contrast: 'normal' },
  accessibility: { reduceMotion: 'system', underlineLinks: false },
  editor: { fontSize: 14, tabSize: 2, wordWrap: false, minimap: false, lineNumbers: true, ligatures: false, autoClose: true, theme: 'auto', defaultLanguage: 'javascript' },
  notifications: { streakReminder: true, weeklyDigest: true, achievements: true, productUpdates: false, reminderTime: '20:00', timezone: null },
};

// Maps an account-preference patch onto the local UI slice so changes show up
// instantly (theme, accent, editor …) without waiting for the network.
function toUiPatch(patch) {
  const ui = {};
  if (patch.appearance) {
    const { theme, accent, density, fontScale, contrast } = patch.appearance;
    if (theme) ui.themePref = theme;
    Object.assign(ui, Object.fromEntries(Object.entries({ accent, density, fontScale, contrast }).filter(([, v]) => v !== undefined)));
  }
  if (patch.accessibility) Object.assign(ui, patch.accessibility);
  if (patch.editor) ui.editor = patch.editor;
  return ui;
}

const mergePrefs = (prefs, patch) => {
  const out = { ...prefs };
  for (const [section, values] of Object.entries(patch)) out[section] = { ...prefs[section], ...values };
  return out;
};

export function usePreferences() {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const stored = useSelector((s) => s.auth.user?.preferences);

  const prefs = useMemo(() => {
    const out = {};
    for (const k of Object.keys(DEFAULTS)) out[k] = { ...DEFAULTS[k], ...(stored?.[k] || {}) };
    return out;
  }, [stored]);

  const prefsRef = useRef(prefs);
  prefsRef.current = prefs;
  const pending = useRef({});
  const timer = useRef(null);
  const lastSaved = useRef(stored);
  useEffect(() => {
    lastSaved.current = stored;
  }, [stored]);

  const flush = useCallback(async () => {
    clearTimeout(timer.current);
    timer.current = null;
    const patch = pending.current;
    pending.current = {};
    if (!Object.keys(patch).length) return;
    try {
      const { data } = await usersApi.updatePreferences(patch);
      lastSaved.current = data.data.preferences;
      dispatch(userUpdated({ preferences: data.data.preferences }));
    } catch (err) {
      enqueueSnackbar(`Couldn't save: ${extractErrorMessage(err)}`, { variant: 'error' });
      // roll the UI back to what the server last confirmed
      const saved = lastSaved.current;
      if (saved) {
        dispatch(userUpdated({ preferences: saved }));
        dispatch(setUiPrefs(toUiPatch({ appearance: { ...saved.appearance }, accessibility: saved.accessibility, editor: saved.editor })));
      }
    }
  }, [dispatch, enqueueSnackbar]);

  // Save whatever is still queued if the user navigates away mid-debounce.
  useEffect(() => () => void flush(), [flush]);

  const set = useCallback(
    (section, values) => {
      const patch = { [section]: values };
      const merged = mergePrefs(prefsRef.current, patch);
      dispatch(userUpdated({ preferences: merged }));
      const ui = toUiPatch(patch);
      if (Object.keys(ui).length) dispatch(setUiPrefs(ui));
      pending.current = mergePrefs(pending.current, patch);
      clearTimeout(timer.current);
      timer.current = setTimeout(flush, 450);
    },
    [dispatch, flush]
  );

  const reset = useCallback(
    (section) => {
      const { reminderTime, timezone, ...rest } = DEFAULTS[section];
      set(section, section === 'notifications' ? { ...rest, reminderTime, timezone } : rest);
    },
    [set]
  );

  return { prefs, set, reset, flush };
}

// "Validation failed" alone is useless — append the field messages the API sends.
export function describeError(err) {
  const base = extractErrorMessage(err);
  const details = err?.response?.data?.details;
  if (details && typeof details === 'object') {
    const parts = Object.entries(details).flatMap(([k, v]) => (Array.isArray(v) ? v : [v]).map((m) => `${k}: ${m}`));
    if (parts.length) return `${base} — ${parts.join('; ')}`;
  }
  return base;
}
