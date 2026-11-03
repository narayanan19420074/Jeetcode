import { Stack, Typography } from '@mui/material';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import { LIB_ACCENT, LIB_TRACKING, useLibraryPalette } from '../../dashboard/components/libraryStyle';
import { panelSx } from '../../dashboard/components/libraryDesktopStyles';
import { FONT_SIZES } from '../../../app/design/designTokens';

export default function MerchNotice({ minSolved, solved }) {
  const palette = useLibraryPalette();
  return (
    <Stack direction="row" role="note" sx={[panelSx(palette), { py: 2, gap: 1.25, alignItems: 'center' }]}>
      <LockRoundedIcon sx={{ fontSize: FONT_SIZES.heading, color: LIB_ACCENT, flexShrink: 0 }} />
      <Typography sx={{ fontSize: FONT_SIZES.bodyLg, letterSpacing: LIB_TRACKING }}>Merch unlocks after you solve {minSolved} problems. You have solved {solved}.</Typography>
    </Stack>
  );
}
