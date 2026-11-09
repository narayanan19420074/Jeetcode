import { Box, Button, ButtonBase, Drawer, IconButton, Stack, Typography } from '@mui/material';
import { FONT_SIZES, FONT_WEIGHTS, RADII, RADII_PX } from '../../../app/design/designTokens';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import { LibraryFont, libChipSx, libSectionTitleSx, libSolidBtnSx, useLibraryPalette } from '../../dashboard/components/libraryStyle';
import { ACCENT, PERIODS, SCOPES, TRACKS } from './leaderboardConfig';

export function SectionTitle({ children }) {
  return (
    <Typography component="h2" sx={{ ...libSectionTitleSx, mb: 1.5 }}>
      {children}
    </Typography>
  );
}

// ---------- controls ----------

// A group of options as wrapping pills (used inside the filter sheet).
export function FilterGroup({ label, options, value, onChange, disabled = () => false }) {
  return (
    <Box component="section" aria-label={label} sx={{ mt: 2.5 }}>
      <Typography component="h3" sx={{ fontWeight: FONT_WEIGHTS.bold, fontSize: FONT_SIZES.title, lineHeight: '24px', mb: 1 }}>
        {label}
      </Typography>
      <Box role="radiogroup" aria-label={label} sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {options.map(([v, text]) => {
          const on = v === value;
          return (
            <ButtonBase
              key={v}
              role="radio"
              aria-checked={on}
              disabled={disabled(v)}
              onClick={() => onChange(v)}
              sx={libChipSx(on)}
            >
              {text}
            </ButtonBase>
          );
        })}
      </Box>
    </Box>
  );
}

// Everyone / Friends, Overall / Coding / Aptitude and All-time / Weekly / Monthly live in one sheet.
export function FilterSheet({ open, onClose, isAuthenticated, track, period, scope, onTrack, onPeriod, onScope, onReset, isDefault }) {
  const pal = useLibraryPalette();
  return (
    <Drawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      slotProps={{ paper: { sx: { borderRadius: `${RADII.card}px ${RADII.card}px 0 0`, maxHeight: '90dvh', backgroundImage: 'none', bgcolor: pal.bg, color: pal.text } } }}
    >
      <LibraryFont>
      <Box sx={{ px: 2, pt: 1, pb: 'calc(16px + env(safe-area-inset-bottom))' }}>
        <Stack direction="row" sx={{ alignItems: 'center', gap: 0.5 }}>
          <IconButton onClick={onClose} aria-label="Close filters" sx={{ width: 44, height: 44, ml: -1, color: pal.text }}>
            <KeyboardArrowDownRoundedIcon />
          </IconButton>
          <Typography component="h2" sx={{ flex: 1, ...libSectionTitleSx }}>
            Filters
          </Typography>
          <Button onClick={onReset} disabled={isDefault} sx={{ borderRadius: RADII_PX.pill, textTransform: 'none', fontWeight: FONT_WEIGHTS.medium, fontSize: FONT_SIZES.title, color: ACCENT }}>
            Reset
          </Button>
        </Stack>

        <FilterGroup label="Leaderboard" options={SCOPES} value={scope} onChange={onScope} disabled={(v) => v === 'friends' && !isAuthenticated} />
        {!isAuthenticated && (
          <Typography color="var(--lib-muted)" sx={{ fontSize: FONT_SIZES.body, mt: 1 }}>
            Sign in to compare with friends.
          </Typography>
        )}
        <FilterGroup label="Track" options={TRACKS} value={track} onChange={onTrack} />
        <FilterGroup label="Period" options={PERIODS} value={period} onChange={onPeriod} />

        <Button onClick={onClose} fullWidth disableElevation variant="contained" sx={{ ...libSolidBtnSx, mt: 3 }}>
          Done
        </Button>
      </Box>
      </LibraryFont>
    </Drawer>
  );
}

// ---------- row pieces ----------
