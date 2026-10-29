import { Box, Drawer, IconButton, Stack, Typography } from '@mui/material';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import { LibraryFont, libBackBtnSx, libSectionTitleSx, useLibraryPalette } from '../dashboard/components/libraryStyle';

// Phone: the problem statement as a sheet that slides up over the editor (see useDescPanel).
// The arrow at the top closes it; the phone's Back button does too. Library look: cream surface, 24px top corners.
export default function ProblemSheet({ open, onClose, children }) {
  const pal = useLibraryPalette();
  return (
    <Drawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      slotProps={{
        paper: { sx: { height: '94dvh', maxHeight: '94dvh', borderRadius: '24px 24px 0 0', backgroundImage: 'none', bgcolor: pal.bg, color: pal.text, display: 'flex', flexDirection: 'column' } },
      }}
    >
      {/* Portals do not inherit the library variables, so the sheet content gets its own scope. */}
      <LibraryFont sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
        <Stack direction="row" sx={{ alignItems: 'center', gap: 0.5, px: 2, pt: 1, flexShrink: 0 }}>
          <IconButton onClick={onClose} aria-label="Close problem" sx={libBackBtnSx}>
            <KeyboardArrowDownRoundedIcon />
          </IconButton>
          <Typography component="h2" sx={{ ...libSectionTitleSx, flex: 1 }}>
            Problem
          </Typography>
        </Stack>
        <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', px: 2, pt: 1, pb: 'calc(24px + env(safe-area-inset-bottom))' }}>{children}</Box>
      </LibraryFont>
    </Drawer>
  );
}
