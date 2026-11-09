import { Box, Button, ButtonBase, Chip, Divider, Skeleton, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useSelector } from 'react-redux';
import { FONT_WEIGHTS, FONT_SIZES, RADII_PX } from '../../../../app/design/designTokens';
import { UserAvatar } from './Identity';

// Icon + count button for the action row (comments etc.).
export function ActionButton({ icon, count, label, onClick }) {
  return (
    <Button
      color="inherit"
      aria-label={label}
      onClick={onClick}
      startIcon={icon}
      sx={(t) => ({
        height: 40,
        px: 1.5,
        minWidth: 0,
        borderRadius: RADII_PX.pill,
        color: 'text.primary',
        bgcolor: alpha(t.palette.text.primary, t.palette.mode === 'dark' ? 0.1 : 0.06),
        fontWeight: FONT_WEIGHTS.semibold,
        fontSize: FONT_SIZES.bodyLg,
        '& .MuiButton-startIcon': { mr: 1, '& svg': { fontSize: FONT_SIZES.display } },
      })}
    >
      {count}
    </Button>
  );
}

// Pill segmented control (sort). Scrolls sideways instead of wrapping.
export function SegmentedTabs({ value, onChange, options }) {
  return (
    <Stack
      direction="row"
      role="tablist"
      spacing={0.5}
      sx={{ p: 0.5, borderRadius: RADII_PX.pill, bgcolor: 'action.hover', width: 'fit-content', maxWidth: '100%', overflowX: 'auto', '&::-webkit-scrollbar': { display: 'none' } }}
    >
      {options.map((o) => {
        const on = o.value === value;
        return (
          <Button
            key={o.value}
            role="tab"
            aria-selected={on}
            onClick={() => onChange(o.value)}
            startIcon={o.icon}
            sx={(t) => ({
              height: 40,
              px: 2,
              flexShrink: 0,
              whiteSpace: 'nowrap',
              borderRadius: RADII_PX.pill,
              fontWeight: FONT_WEIGHTS.bold,
              color: on ? 'primary.main' : 'text.secondary',
              bgcolor: on ? 'background.paper' : 'transparent',
              boxShadow: on ? `0 1px 4px ${alpha(t.palette.primary.main, 0.28)}` : 'none',
              '& .MuiButton-startIcon svg': { fontSize: FONT_SIZES.heading },
              '&:hover': { bgcolor: on ? 'background.paper' : 'action.hover' },
            })}
          >
            {o.label}
          </Button>
        );
      })}
    </Stack>
  );
}

// Horizontal scrolling filter chips (language filter).
export function FilterChips({ value, onChange, options }) {
  return (
    <Stack direction="row" spacing={1} sx={{ overflowX: 'auto', py: 0.5, '&::-webkit-scrollbar': { display: 'none' } }}>
      {options.map((o) => {
        const on = o.value === value;
        return (
          <Chip
            key={o.value || 'all'}
            clickable
            onClick={() => onChange(o.value)}
            label={o.label}
            color={on ? 'primary' : 'default'}
            variant={on ? 'filled' : 'outlined'}
            sx={{ height: 36, fontWeight: FONT_WEIGHTS.semibold, flexShrink: 0, fontSize: FONT_SIZES.body }}
          />
        );
      })}
    </Stack>
  );
}

// "What's on your mind?" bar at the top of a feed.
export function ComposerPrompt({ icon, placeholder, onClick }) {
  const user = useSelector((s) => s.auth.user);
  return (
    <ButtonBase
      onClick={onClick}
      sx={{ width: '100%', justifyContent: 'flex-start', gap: 1.5, px: 1.5, py: 1, minHeight: 60, border: '1px solid', borderColor: 'divider', borderRadius: RADII_PX.pill, textAlign: 'left' }}
    >
      {user && <UserAvatar user={user} size={38} />}
      <Typography color="text.secondary" noWrap sx={{ flex: 1, fontSize: FONT_SIZES.bodyLg, pl: user ? 0 : 1 }}>
        {placeholder}
      </Typography>
      <Box
        sx={(t) => ({ width: 40, height: 40, borderRadius: '50%', display: 'grid', placeItems: 'center', flexShrink: 0, color: 'primary.main', bgcolor: alpha(t.palette.primary.main, 0.12), '& svg': { fontSize: FONT_SIZES.display } })}
      >
        {icon}
      </Box>
    </ButtonBase>
  );
}

export function EmptyBlock({ icon, title, text }) {
  return (
    <Stack sx={{ alignItems: 'center', textAlign: 'center', py: 6, px: 2, gap: 1.5 }}>
      <Box
        sx={(t) => ({ width: 72, height: 72, borderRadius: '50%', display: 'grid', placeItems: 'center', bgcolor: alpha(t.palette.primary.main, 0.12), color: 'primary.main', '& svg': { fontSize: FONT_SIZES.hero } })}
      >
        {icon}
      </Box>
      <Typography sx={{ fontWeight: FONT_WEIGHTS.bold, fontSize: FONT_SIZES.title }}>{title}</Typography>
      <Typography color="text.secondary" sx={{ maxWidth: 320, fontSize: FONT_SIZES.bodyLg }}>
        {text}
      </Typography>
    </Stack>
  );
}

// Skeleton shaped like the real feed posts (avatar, text, optional code box, action row).
export function FeedSkeleton({ count = 3, withCode = false }) {
  return (
    <Stack divider={<Divider flexItem />}>
      {Array.from({ length: count }).map((_, i) => (
        <Box key={i} sx={{ py: 2 }}>
          <Stack direction="row" alignItems="center" spacing={1.25}>
            <Skeleton variant="circular" width={40} height={40} />
            <Box sx={{ flex: 1 }}>
              <Skeleton width="38%" height={20} />
              <Skeleton width="22%" height={14} />
            </Box>
          </Stack>
          <Skeleton width="78%" height={28} sx={{ mt: 1.5 }} />
          <Skeleton width="95%" height={20} />
          {withCode && <Skeleton variant="rounded" height={120} sx={{ mt: 1.5, borderRadius: RADII_PX.card }} />}
          <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
            <Skeleton variant="rounded" width={104} height={42} sx={{ borderRadius: RADII_PX.pill }} />
            <Skeleton variant="rounded" width={64} height={42} sx={{ borderRadius: RADII_PX.pill }} />
          </Stack>
        </Box>
      ))}
    </Stack>
  );
}
