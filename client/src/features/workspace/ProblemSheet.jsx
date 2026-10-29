import { Box, Drawer, IconButton, Stack, Typography } from '@mui/material';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';

// Phone: the problem statement as a sheet that slides up over the editor (see useDescPanel).
// The arrow at the top closes it; the phone's Back button does too.
export default function ProblemSheet({ open, onClose, children }) {
  return (
    <Drawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      slotProps={{
        paper: { sx: { height: '94dvh', maxHeight: '94dvh', borderRadius: '26px 26px 0 0', backgroundImage: 'none', display: 'flex', flexDirection: 'column' } },
      }}
    >
      <Stack direction="row" sx={{ alignItems: 'center', gap: 0.5, px: 1.75, pt: 1, pb: 0.5, flexShrink: 0 }}>
        <IconButton onClick={onClose} aria-label="Close problem" sx={{ width: 44, height: 44 }}>
          <KeyboardArrowDownRoundedIcon />
        </IconButton>
        <Typography component="h2" sx={{ flex: 1, fontWeight: 800, fontSize: '1.05rem' }}>
          Problem
        </Typography>
      </Stack>
      <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', px: 2, pt: 1, pb: 'calc(24px + env(safe-area-inset-bottom))' }}>{children}</Box>
    </Drawer>
  );
}
