import { Box, Drawer, Stack, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import { WsButton, WsIconButton } from './wsUi';
import { wsSurface } from './workspaceTheme';

// Phone: the problem description, sliding in from the right (see useDescPanel).
export default function DescriptionDrawer({ open, onClose, children }) {
  const surf = wsSurface(useTheme());
  return (
    <Drawer anchor="right" open={open} onClose={onClose} slotProps={{ paper: { sx: { width: '100%', maxWidth: '100%' } } }}>
      <Stack direction="row" sx={{ alignItems: 'center', gap: 0.5, px: 1, pb: 0.75, pt: 'calc(6px + env(safe-area-inset-top))', flexShrink: 0, bgcolor: surf.chrome }}>
        <WsIconButton title="Back to code" size="lg" onClick={onClose}>
          <ArrowBackRoundedIcon />
        </WsIconButton>
        <Typography sx={{ fontWeight: 700, flex: 1 }}>Problem</Typography>
      </Stack>
      <Box sx={{ overflowY: 'auto', px: 2, pt: 1, pb: 3, flex: 1, minHeight: 0, bgcolor: surf.chrome }}>{children}</Box>
      <Box sx={{ flexShrink: 0, p: 1.5, pb: 'calc(12px + env(safe-area-inset-bottom))', borderTop: '1px solid', borderColor: 'divider', bgcolor: surf.chrome }}>
        <WsButton fullWidth size="lg" variant="primary" startIcon={<CodeRoundedIcon />} onClick={onClose}>
          Start coding
        </WsButton>
      </Box>
    </Drawer>
  );
}
