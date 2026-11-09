import { IconButton, Paper, Stack, Typography } from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ScratchPad from '../ScratchPad';
import { COLOR_PALETTE, FONT_WEIGHTS, RADII_PX, RADII } from '../../../app/design/designTokens';
import { NAVY } from './examStyle';

// Floating calculator; it sits left of the palette column on wide screens.
export default function ExamCalculator({ compact, onClose }) {
  return (
      <Paper elevation={8} sx={{ position: 'fixed', top: 104, right: compact ? 12 : 336, width: 300, zIndex: (t) => t.zIndex.modal - 1, borderRadius: RADII_PX.control }}>
        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', bgcolor: NAVY, color: COLOR_PALETTE.white, px: 1.5, py: 0.5, borderRadius: `${RADII.badge}px ${RADII.badge}px 0 0` }}>
          <Typography variant="caption" sx={{ fontWeight: FONT_WEIGHTS.bold }}>
            Calculator
          </Typography>
          <IconButton size="small" onClick={onClose} sx={{ color: COLOR_PALETTE.white }}>
            <CloseRoundedIcon fontSize="small" />
          </IconButton>
        </Stack>
        <ScratchPad />
      </Paper>
  );
}
