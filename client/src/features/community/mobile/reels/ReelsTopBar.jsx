import { IconButton, Stack, Typography } from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import { FONT_WEIGHTS } from '../../../../app/design/designTokens';
import { blackFade } from './reelStyle';

const barSx = (theme) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  alignItems: 'center',
  gap: 1,
  px: 1,
  pt: 'env(safe-area-inset-top)',
  pb: 2,
  color: 'common.white',
  background: blackFade(theme, 'to bottom'),
});

// Back arrow over the top of the viewer; it returns to the community feed.
export default function ReelsTopBar({ onBack }) {
  return (
    <Stack direction="row" sx={barSx}>
      <IconButton aria-label="Back to community" onClick={onBack} sx={{ color: 'inherit' }}>
        <ArrowBackRoundedIcon />
      </IconButton>
      <Typography component="h1" variant="subtitle1" sx={{ fontWeight: FONT_WEIGHTS.semibold }}>
        Posts
      </Typography>
    </Stack>
  );
}
