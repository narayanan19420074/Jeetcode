import { Link as RouterLink } from 'react-router-dom';
import { Box, IconButton, Stack } from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import { LibraryFont, useLibraryPalette } from '../../dashboard/components/libraryStyle';
import SectionOutlet from '../common/SectionOutlet';

// Phone: back arrow only. The section shows its own title below, in the Library type (Roboto).
export default function PhoneSectionPage({ section, current }) {
  const pal = useLibraryPalette();
  return (
    <LibraryFont>
      <Box sx={{ maxWidth: 640, mx: 'auto', px: 2, pt: 'calc(8px + env(safe-area-inset-top))', pb: 2 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 2, alignItems: 'start' }}>
          <Stack direction="row" sx={{ alignItems: 'center' }}>
            <IconButton component={RouterLink} to="/settings" aria-label="Back to settings" sx={{ width: 44, height: 44, ml: -1, color: pal.text }}><ArrowBackRoundedIcon /></IconButton>
          </Stack>
          <Box key={section} component="main" aria-label={current?.label} sx={{ minWidth: 0, maxWidth: 780 }}>
            <SectionOutlet section={section} />
          </Box>
        </Box>
      </Box>
    </LibraryFont>
  );
}
