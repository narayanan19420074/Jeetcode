import { cloneElement } from 'react';
import { Box, ButtonBase, Typography } from '@mui/material';
import { tint } from '../../dashboard/dashboardUtils';
import { LIB_TRACKING, useLibraryPalette } from '../../dashboard/components/libraryStyle';
import { panelSx } from '../../dashboard/components/libraryDesktopStyles';
import { FONT_SIZES, FONT_WEIGHTS } from '../../../app/design/designTokens';

function TrackButton({ item, selected, onPick }) {
  return (
    <ButtonBase
      onClick={() => onPick(item.key)}
      aria-pressed={selected}
      sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: 1.5, width: '100%', p: 1, borderRadius: '16px', textAlign: 'left', fontFamily: 'inherit', color: selected ? item.color : 'text.primary', bgcolor: selected ? tint(item.color, 14) : 'transparent', border: `1px solid ${selected ? tint(item.color, 40) : 'transparent'}` }}
    >
      <Box sx={{ width: 40, height: 40, borderRadius: '13px', display: 'grid', placeItems: 'center', flexShrink: 0, color: item.color, bgcolor: tint(item.color, selected ? 24 : 12) }}>
        {cloneElement(item.icon, { sx: { fontSize: FONT_SIZES.display } })}
      </Box>
      <Typography noWrap sx={{ fontWeight: FONT_WEIGHTS.medium, fontSize: FONT_SIZES.title, letterSpacing: LIB_TRACKING }}>{item.label}</Typography>
    </ButtonBase>
  );
}

// Section picker (Aptitude, Reasoning, Verbal, Data). Hidden when there is only one section.
export default function TrackPicker({ tracks, track, onPick }) {
  const palette = useLibraryPalette();
  if (tracks.length < 2) return null;
  return (
    <Box role="group" aria-label="Aptitude sections" sx={[panelSx(palette), { p: 1, display: 'grid', gap: 0.5 }]}>
      {tracks.map((item) => <TrackButton key={item.key} item={item} selected={item.key === track.key} onPick={onPick} />)}
    </Box>
  );
}
