import { Stack, Typography } from '@mui/material';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import { LIB_ACCENT, LIB_TRACKING, useLibraryPalette } from '../../dashboard/components/libraryStyle';
import { panelSx } from '../../dashboard/components/libraryDesktopStyles';

export default function MerchNotice({ minSolved, solved }) {
  const palette = useLibraryPalette();
  return (
    <Stack direction="row" role="note" sx={[panelSx(palette), { py: 2, gap: 1.25, alignItems: 'center' }]}>
      <LockRoundedIcon sx={{ fontSize: 20, color: LIB_ACCENT, flexShrink: 0 }} />
      <Typography sx={{ fontSize: 15, letterSpacing: LIB_TRACKING }}>Merch unlocks after you solve {minSolved} problems. You have solved {solved}.</Typography>
    </Stack>
  );
}
