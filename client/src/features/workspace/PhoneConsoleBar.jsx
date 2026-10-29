import { Box, Button, Stack, Typography } from '@mui/material';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import { LIB_TRACKING, libTintBtnSx, useLibraryPalette } from '../dashboard/components/libraryStyle';

// Phone console under the editor, in the Library look: a cream bar with the word "Console", the verdict,
// Run / Submit and a chevron. Tap the bar to open or close the testcase / result panel.
//   showLabel  show the word "Console" (hidden once a result needs the room)
//   chip       verdict chip
//   canShare   an accepted submission can be shared
//   actions    Run / Submit buttons
export default function PhoneConsoleBar({ open, setOpen, showLabel = true, chip, canShare = false, onShare, actions, children }) {
  const pal = useLibraryPalette();
  return (
    <Box
      sx={{
        bgcolor: pal.chip,
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        flexShrink: 0,
        maxHeight: open ? '45%' : 'auto',
        pb: 'env(safe-area-inset-bottom)',
      }}
    >
      <Stack direction="row" onClick={() => setOpen((o) => !o)} sx={{ alignItems: 'center', gap: 1, px: 2, height: 60, flexShrink: 0, cursor: 'pointer', userSelect: 'none' }}>
        {showLabel && <Typography sx={{ fontSize: 16, fontWeight: 500, letterSpacing: LIB_TRACKING }}>Console</Typography>}
        {chip}
        <Box sx={{ flex: 1 }} />
        <Stack direction="row" sx={{ gap: 1, alignItems: 'center' }} onClick={(e) => e.stopPropagation()}>
          {actions}
        </Stack>
        <ExpandMoreRoundedIcon aria-hidden sx={{ color: pal.muted, transition: 'transform .2s', transform: open ? 'none' : 'rotate(180deg)' }} />
      </Stack>

      {open && (
        <Box sx={{ pt: 0.25, flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
          {canShare && (
            <Box sx={{ px: 2, pb: 1.5 }}>
              <Button disableElevation onClick={onShare} sx={{ ...libTintBtnSx, bgcolor: pal.bg, height: 36, px: 2, fontSize: 15 }}>
                Share solution
              </Button>
            </Box>
          )}
          {children}
        </Box>
      )}
    </Box>
  );
}
