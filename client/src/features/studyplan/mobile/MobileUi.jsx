import { Box, ButtonBase, Drawer, IconButton, Stack, Typography } from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { tint } from '../../dashboard/dashboardUtils';
import { LIB_TRACKING, LibraryFont, libIconBtnSx, libSectionTitleSx, useLibraryPalette } from '../../dashboard/components/libraryStyle';
import { COLOR_PALETTE, FONT_SIZES, FONT_WEIGHTS, RADII_PX, RADII } from '../../../app/design/designTokens';
import { ACCENT } from './mobileStyle';

// Small building blocks used by several phone Study Plan screens.

export function SectionTitle({ children }) {
  return (
    <Typography component="h2" sx={{ ...libSectionTitleSx, mb: 1.5 }}>
      {children}
    </Typography>
  );
}

// Small label chip. A colour tints it; without one it is neutral.
export function Chip({ color, children }) {
  return (
    <Typography
      component="span"
      sx={{
        px: 1.5,
        height: 28,
        display: 'inline-flex',
        alignItems: 'center',
        borderRadius: RADII_PX.pill,
        fontSize: FONT_SIZES.body,
        fontWeight: FONT_WEIGHTS.medium,
        letterSpacing: LIB_TRACKING,
        whiteSpace: 'nowrap',
        fontVariantNumeric: 'tabular-nums',
        color: color || 'var(--lib-chip-text)',
        bgcolor: color ? tint(color, 16) : 'var(--lib-bg)',
      }}
    >
      {children}
    </Typography>
  );
}

// Filled progress disc: the coloured sector grows clockwise with the percentage solved.
export function PlanDisc({ percent, accent, size = 72 }) {
  const pct = Math.max(0, Math.min(100, Math.round(percent || 0)));
  return (
    <Box
      role="img"
      aria-label={`${pct}% solved`}
      sx={{
        width: size,
        height: size,
        flexShrink: 0,
        borderRadius: '50%',
        display: 'grid',
        placeItems: 'center',
        background: `conic-gradient(${accent} ${pct}%, ${tint(accent, 18)} 0)`,
      }}
    >
      <Box sx={{ width: size * 0.6, height: size * 0.6, borderRadius: '50%', display: 'grid', placeItems: 'center', bgcolor: 'var(--lib-bg)' }}>
        <Typography component="span" sx={{ fontSize: size * 0.2, lineHeight: 1, fontWeight: FONT_WEIGHTS.bold, fontVariantNumeric: 'tabular-nums', color: 'var(--lib-text)' }}>
          {pct}%
        </Typography>
      </Box>
    </Box>
  );
}

export function Sheet({ open, onClose, title, children }) {
  const pal = useLibraryPalette();
  return (
    <Drawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      slotProps={{ paper: { sx: { borderRadius: `${RADII.card}px ${RADII.card}px 0 0`, maxHeight: '90dvh', pb: 'env(safe-area-inset-bottom)', bgcolor: pal.bg, backgroundImage: 'none' } } }}
    >
      <LibraryFont>
        <Box sx={{ px: 2, pt: 1.5, pb: 2 }}>
          <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
            <Typography component="h2" sx={{ ...libSectionTitleSx, color: 'var(--lib-text)' }}>
              {title}
            </Typography>
            <IconButton onClick={onClose} aria-label={`Close ${title.toLowerCase()}`} sx={libIconBtnSx}>
              <CloseRoundedIcon />
            </IconButton>
          </Stack>
          {children}
        </Box>
      </LibraryFont>
    </Drawer>
  );
}

export function PillTabs({ label, options, value, onChange, accent = ACCENT }) {
  return (
    <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' } }} role="tablist" aria-label={label}>
      {options.map(([v, text]) => {
        const on = v === value;
        return (
          <ButtonBase
            key={v}
            role="tab"
            aria-selected={on}
            onClick={() => onChange(v)}
            sx={{
              flexShrink: 0,
              height: 34,
              px: 2,
              borderRadius: RADII_PX.pill,
              fontFamily: 'inherit',
              fontSize: FONT_SIZES.bodyLg,
              letterSpacing: LIB_TRACKING,
              whiteSpace: 'nowrap',
              bgcolor: on ? accent : 'var(--lib-chip)',
              color: on ? COLOR_PALETTE.white : 'var(--lib-chip-text)',
            }}
          >
            {text}
          </ButtonBase>
        );
      })}
    </Box>
  );
}
