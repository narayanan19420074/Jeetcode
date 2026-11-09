import { Box, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import CalculateRoundedIcon from '@mui/icons-material/CalculateRounded';
import FullscreenRoundedIcon from '@mui/icons-material/FullscreenRounded';
import FullscreenExitRoundedIcon from '@mui/icons-material/FullscreenExitRounded';
import GridViewRoundedIcon from '@mui/icons-material/GridViewRounded';
import CloudDoneRoundedIcon from '@mui/icons-material/CloudDoneRounded';
import CloudOffRoundedIcon from '@mui/icons-material/CloudOffRounded';
import { formatClock } from '../components/aptitudeUi';
import { COLOR_PALETTE, withAlpha, FONT_WEIGHTS, FONT_SIZES, RADII_PX, MOTION } from '../../../app/design/designTokens';
import { NAVY, mono } from './examStyle';

// Header bar: save status, calculator, full screen, palette drawer and the
// countdown (turns red in the last five minutes so the learner notices).
export default function ExamHeader({ saveState, calcOpen, onToggleCalc, isFull, onToggleFull, compact, onOpenPalette, low, remaining }) {
  return (
    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', bgcolor: NAVY, color: COLOR_PALETTE.white, px: { xs: 1.5, sm: 2.5 }, height: 56, flexShrink: 0 }}>
      <Typography sx={{ fontWeight: FONT_WEIGHTS.bold, letterSpacing: '-0.01em', fontSize: FONT_SIZES.subheading }}>JeetCode</Typography>
      <Typography variant="body2" sx={{ opacity: 0.8, display: { xs: 'none', sm: 'block' } }}>
        Aptitude Test
      </Typography>
      <Box sx={{ flexGrow: 1 }} />
      <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', opacity: 0.85, display: { xs: 'none', md: 'flex' }, mr: 1 }}>
        {saveState === 'error' ? <CloudOffRoundedIcon sx={{ fontSize: FONT_SIZES.subheading, color: COLOR_PALETTE.red[300] }} /> : <CloudDoneRoundedIcon sx={{ fontSize: FONT_SIZES.subheading }} />}
        <Typography variant="caption">{saveState === 'saving' ? 'Saving…' : saveState === 'error' ? 'Offline — retrying' : 'All changes saved'}</Typography>
      </Stack>
      <Tooltip title="Calculator">
        <IconButton onClick={onToggleCalc} sx={{ color: COLOR_PALETTE.white, bgcolor: calcOpen ? withAlpha(COLOR_PALETTE.white, 0.18) : 'transparent' }}>
          <CalculateRoundedIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title={isFull ? 'Exit full screen' : 'Full screen'}>
        <IconButton onClick={onToggleFull} sx={{ color: COLOR_PALETTE.white, display: { xs: 'none', sm: 'inline-flex' } }}>
          {isFull ? <FullscreenExitRoundedIcon /> : <FullscreenRoundedIcon />}
        </IconButton>
      </Tooltip>
      {compact && (
        <IconButton onClick={onOpenPalette} sx={{ color: COLOR_PALETTE.white }} aria-label="Question palette">
          <GridViewRoundedIcon />
        </IconButton>
      )}
      <Box sx={{ px: 1.5, py: 0.5, borderRadius: RADII_PX.control, bgcolor: low ? COLOR_PALETTE.red[700] : withAlpha(COLOR_PALETTE.white, 0.14), transition: `background-color ${MOTION.slow}ms` }}>
        <Typography variant="caption" sx={{ opacity: 0.8, display: 'block', lineHeight: 1, fontSize: FONT_SIZES.micro }}>
          TIME LEFT
        </Typography>
        <Typography sx={{ ...mono, fontWeight: FONT_WEIGHTS.bold, fontSize: FONT_SIZES.heading, lineHeight: 1.15 }} aria-live="off">
          {formatClock(remaining ?? 0)}
        </Typography>
      </Box>
    </Stack>
  );
}
