import { Box, ButtonBase, IconButton, InputBase, Tooltip } from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import { LIB_ACCENT, useLibraryPalette } from '../../dashboard/components/libraryStyle';
import { FONT_SIZES, RADII_PX, SIZES } from '../../../app/design/designTokens';
import { filterTabSx, iconButtonSx } from './lbLook';
import { PERIODS, SCOPES, TRACKS } from './boardOptions';

// A filter is only its name; the selected one changes colour.
function FilterTab({ option, active, onSelect, disabled = false }) {
  const pal = useLibraryPalette();
  const { value, label, title } = option;
  return (
    <Tooltip title={disabled ? 'Sign in to use this' : title}>
      <Box component="span" sx={{ display: 'flex' }}>
        <ButtonBase disabled={disabled} onClick={() => onSelect(value)} aria-pressed={active} aria-label={title} sx={filterTabSx(pal, active)}>
          {label}
        </ButtonBase>
      </Box>
    </Tooltip>
  );
}

function FilterGroup({ label, options, value, onChange, isDisabled }) {
  return (
    <Box role="group" aria-label={label} sx={{ display: 'flex', gap: 1, flexShrink: 0 }}>
      {options.map((option) => (
        <FilterTab key={option.value} option={option} active={value === option.value} onSelect={onChange} disabled={isDisabled?.(option)} />
      ))}
    </Box>
  );
}

export const ScopeSwitch = ({ value, onChange, friendsOk }) => (
  <FilterGroup label="Show" options={SCOPES} value={value} onChange={onChange} isDisabled={(option) => option.value === 'friends' && !friendsOk} />
);

export const PeriodSwitch = ({ value, onChange }) => (
  <FilterGroup label="Period" options={PERIODS} value={value} onChange={onChange} />
);

export const TrackTabs = ({ value, onChange }) => (
  <FilterGroup label="Leaderboard track" options={TRACKS} value={value} onChange={onChange} />
);

const searchSx = (pal, width) => ({
  display: 'flex',
  alignItems: 'center',
  gap: 1,
  px: 1.5,
  height: SIZES.leaderboard.controlSize,
  width,
  flexShrink: 0,
  borderRadius: RADII_PX.pill,
  bgcolor: pal.player,
  border: '1px solid transparent',
  '&:focus-within': { borderColor: LIB_ACCENT },
});

export function SearchBox({ value, onChange, width = SIZES.fill }) {
  const pal = useLibraryPalette();
  return (
    <Box sx={searchSx(pal, width)}>
      <SearchRoundedIcon sx={{ fontSize: FONT_SIZES.heading, color: pal.muted }} />
      <InputBase
        value={value} onChange={(event) => onChange(event.target.value)} placeholder="Search name or @handle" inputProps={{ 'aria-label': 'Search players' }}
        sx={{ flex: 1, minWidth: SIZES.flexShrinkMinWidth, fontSize: FONT_SIZES.body, color: pal.text }}
      />
      {value && (
        <IconButton size="small" aria-label="Clear search" onClick={() => onChange('')} sx={{ color: pal.muted }}>
          <CloseRoundedIcon sx={{ fontSize: FONT_SIZES.subheading }} />
        </IconButton>
      )}
    </Box>
  );
}

export function RefreshButton({ onClick }) {
  const pal = useLibraryPalette();
  return (
    <Tooltip title="Refresh">
      <IconButton onClick={onClick} aria-label="Refresh leaderboard" sx={iconButtonSx(pal)}>
        <RefreshRoundedIcon sx={{ fontSize: FONT_SIZES.heading }} />
      </IconButton>
    </Tooltip>
  );
}

export function SearchToggle({ open, onToggle }) {
  const pal = useLibraryPalette();
  const Icon = open ? CloseRoundedIcon : SearchRoundedIcon;
  return (
    <Tooltip title="Search">
      <IconButton onClick={onToggle} aria-label="Search players" sx={iconButtonSx(pal)}>
        <Icon sx={{ fontSize: FONT_SIZES.heading }} />
      </IconButton>
    </Tooltip>
  );
}
