import { forwardRef, useEffect, useState } from 'react';
import { Box, ButtonBase, Button, CircularProgress, IconButton, Select, Stack, Tooltip, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import OpenInFullRoundedIcon from '@mui/icons-material/OpenInFullRounded';
import CloseFullscreenRoundedIcon from '@mui/icons-material/CloseFullscreenRounded';
import { wsSurface } from './workspaceTheme';
import { WS, mono } from './wsTokens';

/* Workspace UI kit. Every control in the workspace comes from here, so
   buttons, icon buttons, tabs and bars share one size, radius and colour rule.

   Button variants
     primary   - the one main action (Submit)
     secondary - normal action on a tonal fill (Run)
     ghost     - quiet action, no fill until hover
   Sizes: md (32px, desktop) | lg (40px, touch) | xl (44px, phone icon buttons) */

const ctrlHeight = (size) => (size === 'xl' ? 44 : size === 'lg' ? WS.ctrlLg : WS.ctrl);

/* Width of an element in px (0 until measured). Pass the element itself (kept
   in state via a callback ref), so panes that mount late are still measured.
   Panes use this to drop labels when the user drags a splitter narrow —
   media queries only know the window, not the pane. */
export function useElementWidth(el) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    if (!el) return undefined;
    setWidth(Math.round(el.getBoundingClientRect().width));
    if (typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver(([entry]) => setWidth(Math.round(entry.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, [el]);
  return width;
}

export function Kbd({ children }) {
  return (
    <Box
      component="kbd"
      sx={(t) => ({
        ...mono,
        fontSize: '0.68rem',
        fontWeight: 500,
        lineHeight: 1,
        px: 0.6,
        py: 0.4,
        borderRadius: '4px',
        color: 'inherit',
        opacity: 0.75,
        bgcolor: alpha(t.palette.text.primary, 0.1),
      })}
    >
      {children}
    </Box>
  );
}

export const WsButton = forwardRef(function WsButton(
  { variant = 'secondary', size = 'md', startIcon, loading = false, kbd, iconOnly = false, title, disabled, children, sx, ...rest },
  ref
) {
  const h = ctrlHeight(size);
  const btn = (
    <Button
      ref={ref}
      disableElevation
      disableRipple
      disabled={disabled || loading}
      aria-label={iconOnly && typeof children === 'string' ? children : rest['aria-label']}
      startIcon={loading ? <CircularProgress size={14} color="inherit" /> : startIcon}
      sx={[
        (t) => {
          const s = wsSurface(t);
          const base = {
            height: h,
            minWidth: 0,
            px: size === 'lg' ? 1.75 : 1.25,
            gap: 0,
            borderRadius: `${WS.radius}px`,
            fontSize: '0.8125rem',
            fontWeight: 600,
            lineHeight: 1,
            whiteSpace: 'nowrap',
            boxShadow: 'none',
            '& .MuiButton-startIcon': { mr: 0.75, ml: -0.25 },
            '& .MuiButton-startIcon svg': { fontSize: 18 },
            '&.Mui-focusVisible': { outline: `2px solid ${t.palette.primary.main}`, outlineOffset: 2 },
          };
          if (variant === 'primary') {
            return {
              ...base,
              color: t.palette.primary.contrastText,
              bgcolor: t.palette.primary.main,
              '&:hover': { bgcolor: t.palette.primary.dark },
              '&.Mui-disabled': { color: t.palette.text.disabled, bgcolor: alpha(t.palette.text.primary, 0.08) },
            };
          }
          if (variant === 'ghost') {
            return {
              ...base,
              color: t.palette.text.secondary,
              bgcolor: 'transparent',
              '&:hover': { bgcolor: alpha(t.palette.text.primary, 0.08), color: t.palette.text.primary },
              '&.Mui-disabled': { color: t.palette.text.disabled },
            };
          }
          return {
            ...base,
            color: t.palette.text.primary,
            bgcolor: s.raised,
            '&:hover': { bgcolor: alpha(t.palette.text.primary, 0.14) },
            '&.Mui-disabled': { color: t.palette.text.disabled, bgcolor: alpha(t.palette.text.primary, 0.05) },
          };
        },
        iconOnly && {
          width: h,
          px: 0,
          '& .MuiButton-startIcon': { m: 0 },
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...rest}
    >
      {!iconOnly && children}
      {!iconOnly && kbd && (
        <Box component="span" sx={{ ml: 1, display: { xs: 'none', xl: 'inline-flex' } }}>
          <Kbd>{kbd}</Kbd>
        </Box>
      )}
    </Button>
  );
  if (!iconOnly) return btn;
  return (
    <Tooltip title={title || (typeof children === 'string' ? children : '')}>
      <span style={{ display: 'inline-flex' }}>{btn}</span>
    </Tooltip>
  );
});

export const WsIconButton = forwardRef(function WsIconButton(
  { title, active = false, size = 'md', disabled, children, sx, ...rest },
  ref
) {
  const h = ctrlHeight(size);
  const btn = (
    <IconButton
      ref={ref}
      disableRipple
      aria-label={rest['aria-label'] || title}
      disabled={disabled}
      sx={[
        (t) => ({
          width: h,
          height: h,
          flexShrink: 0,
          borderRadius: size === 'xl' ? '50%' : `${WS.radius}px`,
          color: active ? t.palette.primary.main : t.palette.text.secondary,
          bgcolor: active ? alpha(t.palette.primary.main, 0.14) : 'transparent',
          '&:hover': { bgcolor: active ? alpha(t.palette.primary.main, 0.2) : alpha(t.palette.text.primary, 0.08), color: active ? t.palette.primary.main : t.palette.text.primary },
          '& svg': { fontSize: size === 'xl' ? 24 : size === 'lg' ? 22 : 19 },
          '&.Mui-focusVisible': { outline: `2px solid ${t.palette.primary.main}`, outlineOffset: 2 },
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...rest}
    >
      {children}
    </IconButton>
  );
  if (!title) return btn;
  return (
    <Tooltip title={title}>
      <span style={{ display: 'inline-flex' }}>{btn}</span>
    </Tooltip>
  );
});

export function MaxButton({ active, onClick, label }) {
  return (
    <WsIconButton
      title={active ? `Restore ${label}` : `Maximize ${label}`}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      {active ? <CloseFullscreenRoundedIcon sx={{ fontSize: '17px !important' }} /> : <OpenInFullRoundedIcon sx={{ fontSize: '17px !important' }} />}
    </WsIconButton>
  );
}

/* Pane header strip. Tone separates it from the body, no border. */
export function PaneBar({ children, sx, height = WS.bar }) {
  return (
    <Stack
      direction="row"
      sx={[
        (t) => ({
          alignItems: 'center',
          gap: 0.5,
          height,
          px: 1.25,
          flexShrink: 0,
          bgcolor: wsSurface(t).chrome,
          minWidth: 0,
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {children}
    </Stack>
  );
}

/* Text tabs: active tab gets a tonal fill. items = [{ value, label, icon?, dot? }] */
export function PaneTabs({ value, onChange, items, size = 'md', labels = 'all' }) {
  const h = size === 'sm' ? 28 : size === 'lg' ? 38 : WS.ctrl;
  return (
    <Stack direction="row" role="tablist" sx={{ gap: 0.25, minWidth: 0, overflowX: 'auto', '&::-webkit-scrollbar': { display: 'none' }, scrollbarWidth: 'none' }}>
      {items.map((it) => {
        const on = it.value === value;
        // labels: 'all' | 'active' (only the open tab keeps its name) | 'none' (icons only)
        const showLabel = labels === 'all' || !it.icon || (labels === 'active' && on);
        const tab = (
          <ButtonBase
            key={it.value}
            aria-label={showLabel ? undefined : it.label}
            role="tab"
            aria-selected={on}
            onClick={() => onChange(it.value)}
            sx={(t) => ({
              height: h,
              px: showLabel ? (size === 'sm' ? 1.25 : size === 'lg' ? 1.75 : 1.5) : 1,
              gap: 0.75,
              flexShrink: 0,
              borderRadius: `${WS.radius}px`,
              fontSize: size === 'sm' ? '0.78rem' : size === 'lg' ? '0.875rem' : '0.8125rem',
              fontWeight: 600,
              whiteSpace: 'nowrap',
              color: on ? t.palette.text.primary : t.palette.text.secondary,
              bgcolor: on ? wsSurface(t).raised : 'transparent',
              '&:hover': { bgcolor: on ? wsSurface(t).raised : alpha(t.palette.text.primary, 0.06), color: t.palette.text.primary },
              '& svg': { fontSize: size === 'sm' ? 15 : 17, color: on ? t.palette.primary.main : 'inherit' },
              '&.Mui-focusVisible': { outline: `2px solid ${t.palette.primary.main}`, outlineOffset: -2 },
            })}
          >
            {it.icon}
            {showLabel && it.label}
            {it.dot && <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: it.dot }} />}
          </ButtonBase>
        );
        return showLabel ? (
          tab
        ) : (
          <Tooltip key={it.value} title={it.label}>
            {tab}
          </Tooltip>
        );
      })}
    </Stack>
  );
}

/* Compact dropdown (language picker). */
export function WsSelect({ sx, ...props }) {
  return (
    <Select
      size="small"
      variant="outlined"
      MenuProps={{ slotProps: { paper: { sx: { mt: 0.5, borderRadius: `${WS.radius + 2}px` } } } }}
      sx={[
        (t) => ({
          height: WS.ctrl,
          minWidth: 132,
          borderRadius: `${WS.radius}px`,
          fontSize: '0.8125rem',
          fontWeight: 600,
          bgcolor: wsSurface(t).raised,
          '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
          '&:hover': { bgcolor: alpha(t.palette.text.primary, 0.14) },
          '&.Mui-focused': { outline: `2px solid ${t.palette.primary.main}`, outlineOffset: -2 },
          '& .MuiSelect-select': { py: 0, display: 'flex', alignItems: 'center', minHeight: 'unset !important', height: `${WS.ctrl}px`, pl: 1.25 },
          '& .MuiSelect-icon': { right: 6 },
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...props}
    />
  );
}

/* Labelled monospace block (input / output / expected). */
export function CodeField({ label, value, tone }) {
  return (
    <Box sx={{ mb: 1.25, '&:last-child': { mb: 0 } }}>
      <Typography variant="caption" sx={{ display: 'block', mb: 0.5, fontWeight: 600, color: 'text.secondary', letterSpacing: '0.02em' }}>
        {label}
      </Typography>
      <Box
        sx={(t) => ({
          ...mono,
          fontSize: '0.8rem',
          lineHeight: 1.65,
          px: 1.5,
          py: 1,
          borderRadius: `${WS.radius}px`,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          color: tone === 'error' ? t.palette.error.main : t.palette.text.primary,
          bgcolor: tone === 'error' ? alpha(t.palette.error.main, 0.1) : wsSurface(t).raised,
        })}
      >
        {value}
      </Box>
    </Box>
  );
}

export function EmptyState({ icon, title, text, action }) {
  return (
    <Stack sx={{ alignItems: 'center', textAlign: 'center', py: 6, px: 2, gap: 1.25 }}>
      <Box
        sx={(t) => ({
          width: 52,
          height: 52,
          borderRadius: '14px',
          display: 'grid',
          placeItems: 'center',
          bgcolor: alpha(t.palette.primary.main, 0.12),
          color: 'primary.main',
          '& svg': { fontSize: 26 },
        })}
      >
        {icon}
      </Box>
      <Typography sx={{ fontWeight: 700 }}>{title}</Typography>
      {text && (
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 320 }}>
          {text}
        </Typography>
      )}
      {action}
    </Stack>
  );
}
