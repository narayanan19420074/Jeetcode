import { cloneElement } from 'react';
import { Box, ButtonBase, Typography } from '@mui/material';
import { LIGHT_CARD_MUTED_OPACITY, LIGHT_CARD_SELECTED_BG, lightCardSx } from '../../dashboard/components/rail/lightCardStyles';
import { LIB_TRACKING } from '../../dashboard/components/libraryStyle';
import { FONT_SIZES, FONT_WEIGHTS, RADII_PX, SIZES } from '../../../app/design/designTokens';

function TrackButton({ item, selected, onPick }) {
  return (
    <ButtonBase
      onClick={() => onPick(item.key)}
      aria-pressed={selected}
      sx={{ display: 'flex', justifyContent: 'flex-start', gap: 1.5, width: SIZES.fill, p: 1, borderRadius: RADII_PX.card, textAlign: 'left', fontFamily: 'inherit', bgcolor: selected ? LIGHT_CARD_SELECTED_BG : 'transparent', opacity: selected ? 1 : LIGHT_CARD_MUTED_OPACITY }}
    >
      <Box sx={{ display: 'grid', placeItems: 'center', flexShrink: 0, p: 1, borderRadius: RADII_PX.card, bgcolor: LIGHT_CARD_SELECTED_BG }}>
        {cloneElement(item.icon, { sx: { fontSize: FONT_SIZES.display } })}
      </Box>
      <Typography noWrap sx={{ fontWeight: FONT_WEIGHTS.medium, fontSize: FONT_SIZES.title, letterSpacing: LIB_TRACKING }}>{item.label}</Typography>
    </ButtonBase>
  );
}

// Section picker (Aptitude, Reasoning, Verbal, Data) on the same white card as the summary. Hidden when there is only one section.
export default function TrackPicker({ tracks, track, onPick }) {
  if (tracks.length < 2) return null;
  return (
    <Box role="group" aria-label="Aptitude sections" sx={[...lightCardSx, { p: 1, display: 'grid', gap: 0.5 }]}>
      {tracks.map((item) => <TrackButton key={item.key} item={item} selected={item.key === track.key} onPick={onPick} />)}
    </Box>
  );
}
