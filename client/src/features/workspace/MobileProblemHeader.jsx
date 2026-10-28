import { Box, ButtonBase, Stack, Typography } from '@mui/material';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import DifficultyChip from '../../components/DifficultyChip';

// Phone: tap the problem name -> the description slides in from the right.
export default function MobileProblemHeader({ problem, onOpen, sx }) {
  return (
    <ButtonBase
      onClick={onOpen}
      aria-label="Open problem description"
      sx={{ justifyContent: 'flex-start', gap: 1.25, pt: 1.25, pb: 0.75, textAlign: 'left', ...sx }}
    >
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography noWrap sx={{ fontWeight: 800, fontSize: '1rem', lineHeight: 1.3, letterSpacing: '-0.01em' }}>
          {problem.title}
        </Typography>
        <Stack direction="row" sx={{ alignItems: 'center', gap: 0.75, mt: 0.5, minWidth: 0 }}>
          <DifficultyChip difficulty={problem.difficulty} />
          {problem.tags?.length > 0 && (
            <Typography noWrap variant="caption" color="text.secondary" sx={{ minWidth: 0 }}>
              {problem.tags.slice(0, 2).join(' · ')}
            </Typography>
          )}
        </Stack>
      </Box>
      <Stack direction="row" sx={{ alignItems: 'center', flexShrink: 0, color: 'primary.main' }}>
        <Typography sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>Problem</Typography>
        <ChevronRightRoundedIcon sx={{ fontSize: 20 }} />
      </Stack>
    </ButtonBase>
  );
}
