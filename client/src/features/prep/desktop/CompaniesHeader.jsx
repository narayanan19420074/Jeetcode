import { Box, Typography } from '@mui/material';
import BusinessRoundedIcon from '@mui/icons-material/BusinessRounded';
import BackToDashboard from '../../../components/BackToDashboard';
import { HeaderTile, LIB_TRACKING, useLibraryPalette } from '../../dashboard/components/libraryStyle';

// Centred header tile, title and subtitle, the same as the phone Companies page.
export default function CompaniesHeader() {
  const palette = useLibraryPalette();
  return (
    <Box sx={{ position: 'relative', textAlign: 'center' }}>
      <BackToDashboard sx={{ position: 'absolute', left: 0, top: 0 }} />
      <HeaderTile><BusinessRoundedIcon sx={{ fontSize: 28 }} /></HeaderTile>
      <Typography component="h1" sx={{ mt: 1.5, fontWeight: 700, fontSize: 26, lineHeight: '32px' }}>Companies</Typography>
      <Typography sx={{ fontSize: 17, lineHeight: '24px', letterSpacing: LIB_TRACKING, color: palette.muted }}>Questions asked by each company</Typography>
    </Box>
  );
}
