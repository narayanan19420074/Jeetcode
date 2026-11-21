import { cloneElement } from 'react';
import { Box, ButtonBase, Typography } from '@mui/material';
import { useLibraryCardSx } from '../../dashboard/components/libraryCardStyles';
import { tint } from '../../dashboard/dashboardUtils';
import { LIB_TRACKING } from '../../dashboard/components/libraryStyle';
import { FONT_SIZES, FONT_WEIGHTS, RADII_PX, SIZES } from '../../../app/design/designTokens';

// The selected row is a soft tint of the card's own text colour, so it reads in light and dark mode.
const SELECTED_BG = tint('currentColor', 12);
const UNSELECTED_OPACITY = 0.72;

function TrackButton({ item, selected, onPick }) {
  return (
    <ButtonBase
      onClick={() => onPick(item.key)}
      aria-pressed={selected}
      sx={{ display: 'flex', justifyContent: 'flex-start', gap: 1.5, width: SIZES.fill, p: 1, borderRadius: RADII_PX.card, textAlign: 'left', fontFamily: 'inherit', bgcolor: selected ? SELECTED_BG : 'transparent', opacity: selected ? 1 : UNSELECTED_OPACITY }}
    >
      <Box sx={{ display: 'grid', placeItems: 'center', flexShrink: 0, p: 1, borderRadius: RADII_PX.card, bgcolor: SELECTED_BG }}>
        {cloneElement(item.icon, { sx: { fontSize: FONT_SIZES.display } })}
      </Box>
      <Typography noWrap sx={{ fontWeight: FONT_WEIGHTS.medium, fontSize: FONT_SIZES.title, letterSpacing: LIB_TRACKING }}>{item.label}</Typography>
    </ButtonBase>
  );
}

// Section picker (Aptitude, Reasoning, Verbal, Data) on the same card as the summary. Hidden when there is only one section.
export default function TrackPicker({ tracks, track, onPick }) {
  const cardSx = useLibraryCardSx();
  if (tracks.length < 2) return null;
  return (
    <Box role="group" aria-label="Aptitude sections" sx={{ ...cardSx, p: 1, gap: 0.5 }}>
      {tracks.map((item) => <TrackButton key={item.key} item={item} selected={item.key === track.key} onPick={onPick} />)}
    </Box>
  );
}
