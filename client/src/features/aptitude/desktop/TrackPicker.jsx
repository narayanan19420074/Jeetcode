import { cloneElement } from 'react';
import { Box, ButtonBase, Typography } from '@mui/material';
import { railCardSx } from '../../dashboard/components/rail/railCardStyles';
import { SOFT } from '../../dashboard/components/rail/railTokens';
import { LIB_TRACKING } from '../../dashboard/components/libraryStyle';
import { COLOR_PALETTE, withAlpha, FONT_SIZES, FONT_WEIGHTS, RADII_PX, SIZES } from '../../../app/design/designTokens';

const SELECTED_TINT = 0.18;
const IDLE_TINT = 0.1;

function TrackButton({ item, selected, onPick }) {
  return (
    <ButtonBase
      onClick={() => onPick(item.key)}
      aria-pressed={selected}
      sx={{ display: 'flex', justifyContent: 'flex-start', gap: 1.5, width: SIZES.fill, p: 1, borderRadius: RADII_PX.card, textAlign: 'left', fontFamily: 'inherit', color: selected ? COLOR_PALETTE.white : SOFT, bgcolor: selected ? withAlpha(COLOR_PALETTE.white, SELECTED_TINT) : 'transparent' }}
    >
      <Box sx={{ display: 'grid', placeItems: 'center', flexShrink: 0, p: 1, borderRadius: RADII_PX.card, bgcolor: withAlpha(COLOR_PALETTE.white, selected ? SELECTED_TINT : IDLE_TINT) }}>
        {cloneElement(item.icon, { sx: { fontSize: FONT_SIZES.display } })}
      </Box>
      <Typography noWrap sx={{ fontWeight: FONT_WEIGHTS.medium, fontSize: FONT_SIZES.title, letterSpacing: LIB_TRACKING }}>{item.label}</Typography>
    </ButtonBase>
  );
}

// Section picker (Aptitude, Reasoning, Verbal, Data) on the same indigo card as the summary. Hidden when there is only one section.
export default function TrackPicker({ tracks, track, onPick }) {
  if (tracks.length < 2) return null;
  return (
    <Box role="group" aria-label="Aptitude sections" sx={[...railCardSx, { p: 1, display: 'grid', gap: 0.5 }]}>
      {tracks.map((item) => <TrackButton key={item.key} item={item} selected={item.key === track.key} onPick={onPick} />)}
    </Box>
  );
}
