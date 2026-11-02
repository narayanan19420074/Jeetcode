import { Box, Stack, Typography } from '@mui/material';
import BackToDashboard from '../../../../components/BackToDashboard';
import { LIB_TRACKING, useLibraryPalette } from '../../components/libraryStyle';
import { sumDifficulties } from '../common/problemsConstants';

export default function ProblemsHeader({ progress }) {
  const palette = useLibraryPalette();
  const solved = sumDifficulties(progress?.solved);
  const total = sumDifficulties(progress?.total);
  return (
    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
      <BackToDashboard />
      <Box sx={{ minWidth: 0 }}>
        <Typography component="h1" noWrap sx={{ fontSize: 26, lineHeight: '32px', fontWeight: 700 }}>Problems</Typography>
        <Typography sx={{ fontSize: 15, letterSpacing: LIB_TRACKING, color: palette.muted, fontVariantNumeric: 'tabular-nums' }}>
          {progress ? `${solved} of ${total} solved` : 'Loading your progress…'}
        </Typography>
      </Box>
    </Stack>
  );
}
